import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from 'react';
import type { CountryCode } from 'libphonenumber-js';
import type { Dictionary } from '@/i18n/dictionaries/types';
import { searchPhoneCountries, type PhoneCountry } from './contact-phone';
import styles from './ContactPhone.module.scss';

type PickerCopy = Dictionary['landing']['contact']['form']['phone'];
const listId = 'contact-phone-countries';

type PickerProps = {
  countries: PhoneCountry[];
  country: PhoneCountry;
  copy: PickerCopy;
  onSelect: (code: CountryCode) => void;
};

export function PhoneCountryPicker({
  countries,
  country,
  copy,
  onSelect,
}: PickerProps) {
  const [placement, setPlacement] = useState<'above' | 'below' | null>(null);
  const picker = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useDismissCountryPopup(picker, Boolean(placement), setPlacement);

  function close() {
    setPlacement(null);
    trigger.current?.focus();
  }

  return (
    <div
      ref={picker}
      onBlur={(event) => {
        if (
          event.relatedTarget &&
          !event.currentTarget.contains(event.relatedTarget)
        )
          setPlacement(null);
      }}
    >
      <button
        ref={trigger}
        type="button"
        className={styles.trigger}
        aria-label={`${copy.country}: ${country.name} +${country.callingCode}`}
        aria-expanded={placement !== null}
        aria-controls={placement ? listId : undefined}
        onClick={({ currentTarget }) =>
          setPlacement(placement ? null : getPopupPlacement(currentTarget))
        }
      >
        <Flag code={country.code} />+{country.callingCode}
      </button>
      {placement && (
        <CountrySearch
          countries={countries}
          country={country.code}
          copy={copy}
          placement={placement}
          onClose={close}
          onSelect={(code) => {
            onSelect(code);
            close();
          }}
        />
      )}
    </div>
  );
}

function useDismissCountryPopup(
  picker: RefObject<HTMLDivElement | null>,
  open: boolean,
  setPlacement: (placement: null) => void,
) {
  useEffect(() => {
    if (!open) return;
    function closeOutside(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !picker.current?.contains(event.target)
      )
        setPlacement(null);
    }
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open, picker, setPlacement]);
}

function getPopupPlacement(trigger: HTMLButtonElement) {
  const { top, bottom } = trigger.getBoundingClientRect();
  const height = window.visualViewport?.height ?? window.innerHeight;
  return height - bottom < 260 && top > 260 ? 'above' : 'below';
}

type CountrySearchProps = {
  countries: PhoneCountry[];
  country: CountryCode;
  copy: PickerCopy;
  placement: 'above' | 'below';
  onClose: () => void;
  onSelect: (code: CountryCode) => void;
};

function CountrySearch({
  countries,
  country,
  copy,
  placement,
  onClose,
  onSelect,
}: CountrySearchProps) {
  const { search, list, query, options, activeId, onKeyDown, changeQuery } =
    useCountrySearch(countries, country, onClose, onSelect);

  return (
    <div className={styles.popup} data-placement={placement}>
      <input
        ref={search}
        className={styles.search}
        type="search"
        role="combobox"
        aria-label={copy.search}
        aria-expanded="true"
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeId}
        placeholder={copy.search}
        autoComplete="off"
        value={query}
        onKeyDown={onKeyDown}
        onChange={(event) => changeQuery(event.currentTarget.value)}
      />
      <div
        ref={list}
        className={styles.options}
        id={listId}
        role="listbox"
        aria-label={copy.country}
        tabIndex={-1}
      >
        {options.map((option) => (
          <CountryOption
            key={option.code}
            option={option}
            active={activeId === optionId(option.code)}
            selected={country === option.code}
            onSelect={onSelect}
          />
        ))}
      </div>
      {options.length === 0 && (
        <p role="status" className={styles.empty}>
          {copy.noResults}
        </p>
      )}
    </div>
  );
}

function useCountrySearch(
  countries: PhoneCountry[],
  country: CountryCode,
  onClose: CountrySearchProps['onClose'],
  onSelect: CountrySearchProps['onSelect'],
) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(
    countries.findIndex(({ code }) => code === country),
  );
  const search = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const options = searchPhoneCountries(countries, query);
  const activeId = options[activeIndex]
    ? optionId(options[activeIndex].code)
    : undefined;

  useEffect(() => {
    search.current?.focus({ preventScroll: true });
  }, []);
  useEffect(() => keepOptionVisible(list.current, activeId), [activeId]);

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex(
        Math.max(0, Math.min(options.length - 1, activeIndex + step)),
      );
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (options[activeIndex]) onSelect(options[activeIndex].code);
    }
  }

  function changeQuery(value: string) {
    setQuery(value);
    setActiveIndex(0);
  }

  return { search, list, query, options, activeId, onKeyDown, changeQuery };
}

function CountryOption({
  option,
  active,
  selected,
  onSelect,
}: {
  option: PhoneCountry;
  active: boolean;
  selected: boolean;
  onSelect: (code: CountryCode) => void;
}) {
  return (
    <button
      id={optionId(option.code)}
      type="button"
      role="option"
      aria-label={`${option.name} +${option.callingCode}`}
      aria-selected={selected}
      data-active={active}
      tabIndex={-1}
      onClick={() => onSelect(option.code)}
    >
      <Flag code={option.code} />
      <span>{option.name}</span>
      <span>+{option.callingCode}</span>
    </button>
  );
}

function optionId(code: CountryCode) {
  return `${listId}-${code}`;
}

function Flag({ code }: { code: CountryCode }) {
  return <span className={`${styles.flag} flag:${code}`} aria-hidden="true" />;
}

function keepOptionVisible(
  list: HTMLDivElement | null,
  id: string | undefined,
) {
  const option = id && document.getElementById(id);
  if (!list || !option) return;
  const viewport = list.getBoundingClientRect();
  const item = option.getBoundingClientRect();
  if (item.top < viewport.top) list.scrollTop += item.top - viewport.top;
  else if (item.bottom > viewport.bottom)
    list.scrollTop += item.bottom - viewport.bottom;
}

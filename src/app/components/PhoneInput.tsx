import { formatUzPhoneInput, UZ_PHONE_INPUT_PREFIX } from '../utils/phone';

const DEFAULT_PLACEHOLDER = '+998 99 999 99 99';

type PhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  id?: string;
};

export function PhoneInput({
  value,
  onChange,
  className,
  placeholder = DEFAULT_PLACEHOLDER,
  id,
}: PhoneInputProps) {
  return (
    <input
      id={id}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      value={value || UZ_PHONE_INPUT_PREFIX}
      onChange={(e) => onChange(formatUzPhoneInput(e.target.value))}
      onBlur={() => {
        if (!value || value.length < UZ_PHONE_INPUT_PREFIX.length) {
          onChange(UZ_PHONE_INPUT_PREFIX);
        }
      }}
      placeholder={placeholder}
      className={className}
    />
  );
}

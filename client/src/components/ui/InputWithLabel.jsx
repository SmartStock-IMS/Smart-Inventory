import PropTypes from "prop-types";
import { Input } from "@components/ui/Input";
import { Label } from "@components/ui/Label";

InputWithLabel.propTypes = {
  label: PropTypes.string,
  inputType: PropTypes.string,
  inputId: PropTypes.string,
  placeHolder: PropTypes.string,
  inputName: PropTypes.string,
  value: PropTypes.string,
  readOnly: PropTypes.bool,
  className: PropTypes.string,
  register: PropTypes.func,
  required: PropTypes.bool,
};

export function InputWithLabel({
  label,
  inputType,
  inputId,
  placeHolder,
  inputName,
  value,
  readOnly,
  className,
  register,
  required,
}) {
  return (
    <div className="grid w-full items-center gap-2">
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        type={inputType}
        id={inputId}
        placeholder={placeHolder}
        name={inputName}
        value={value}
        readOnly={readOnly}
        className={className}
        {...(register && inputName ? register(inputName) : {})} // react-hook-form register
        required={required}
      />
    </div>
  );
}

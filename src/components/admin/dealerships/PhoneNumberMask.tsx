import React from 'react';
import MaskedInput from 'react-text-mask';

const PhoneNumberMask = ({ inputRef = () => {}, ...props }: any) => {
  return (
    <MaskedInput
      {...props}
      ref={(ref: any) => {
        inputRef(ref ? ref.inputElement : null);
      }}
      mask={[
        "(",
        /[1-9]/,
        /\d/,
        /\d/,
        ")",
        " ",
        /\d/,
        /\d/,
        /\d/,
        "-",
        /\d/,
        /\d/,
        /\d/,
        /\d/,
      ]}
      placeholderChar={"_"}
      showMask
    />
  );
};

export default PhoneNumberMask;

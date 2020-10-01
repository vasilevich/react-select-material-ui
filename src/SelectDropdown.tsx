import * as React from "react";
import Creatable, {CreatableProps} from "react-select/creatable";
import AsyncCreatableSelect from 'react-select/async-creatable';
import SelectReadOnly, {Props as ReactSelectProps} from "react-select";
import {isArray, isEmpty, isNil, some, toString} from "lodash";
import {getStyles} from "./SelectDropdownStyles";

class SelectDropdown extends React.Component<SelectDropdownProps> {
    private static spaces: RegExp = /\s/;
    private static SENSITIVITY: Intl.CollatorOptions = {sensitivity: "base"};

    public render() {
        const {
            inputId,
            hasInputFocus,
            value,
            placeholder,
            options,
            selectProps,
            onChange,
            onFocus,
            onBlur,
            promiseOptions,
            defaultOptions,
            cacheOptions
        } = this.props;

        const Select: React.ComponentClass<any> =
            selectProps && selectProps.isCreatable ? (promiseOptions ? AsyncCreatableSelect : Creatable) : SelectReadOnly;
        const optionsProps: any = {};
        if (promiseOptions) {
            optionsProps.cacheOptions = cacheOptions !== undefined ? cacheOptions : false;
            optionsProps.defaultOptions = defaultOptions !== undefined ? defaultOptions : (options !== undefined ? options : []);
            optionsProps.loadOptions = promiseOptions;
        } else {
            optionsProps.options = options;
        }
        return (
            <Select
                inputId={inputId}
                isValidNewOption={this.isValidNewOption}
                captureMenuScroll={false}
                createOptionPosition="first"
                {...selectProps}
                value={value}
                placeholder={placeholder}
                styles={getStyles(selectProps, hasInputFocus)}
                noOptionsMessage={this.noOptionsMessage}
                onChange={onChange}
                onFocus={onFocus}
                onBlur={onBlur}
                {...optionsProps}
            />
        );
    }

    private noOptionsMessage = (obj: { inputValue: string }) => {
        const {selectProps} = this.props;

        if (isNil(selectProps)) {
            return null;
        }

        if (isEmpty(obj) || isEmpty(obj.inputValue)) {
            return (
                selectProps.msgNoOptionsAvailable || "No more options are available"
            );
        }

        const {inputValue} = obj;

        if (
            selectProps.isCreatable !== true ||
            this.containsValue(inputValue) ||
            this.containsOptions(inputValue)
        ) {
            return (
                selectProps.msgNoOptionsMatchFilter || "No options match the filter"
            );
        }

        return (
            selectProps.msgNoValidValue ||
            "The new value is not valid (contains space)"
        );
    };

    private isValidNewOption = (inputValue: string) => {
        if (isEmpty(inputValue)) {
            return false;
        }

        if (this.containsOptions(inputValue)) {
            return false;
        }

        const hasSpaces = SelectDropdown.spaces.test(inputValue);
        return hasSpaces === false;
    };

    private containsOptions(inputValue: string): boolean {
        return some(this.props.options, (option: SelectOption) =>
            this.equalsIgnoringCase(inputValue, option.value)
        );
    }

    private containsValue(inputValue: string): boolean {
        const {value} = this.props;

        if (isArray(value) === false) {
            return false;
        }

        return some(value, (option: SelectOption) =>
            this.equalsIgnoringCase(inputValue, option.value)
        );
    }

    private equalsIgnoringCase(a: string, b: SelectOptionValue) {
        return (
            a.localeCompare(toString(b), undefined, SelectDropdown.SENSITIVITY) === 0
        );
    }
}

const promiseOptions = (inputValue: string) =>
    new Promise(resolve => {
        setTimeout(() => {
            resolve(["test"]);
        }, 1000);
    });

export interface SelectDropdownProps {
    inputId?: string;
    value?: SelectOption | SelectOption[] | null;
    placeholder?: string;
    options?: SelectOption[];
    selectProps?: SelectProps;
    promiseOptions?: (inputValue: string) => Promise<string[]>;
    defaultOptions?: [];
    cacheOptions?: boolean;
    hasInputFocus?: boolean;
    onChange?: (value: SelectOption | SelectOption[] | null) => void;
    onFocus?: (event: any) => void;
    onBlur?: (event: any) => void;
}

export interface SelectProps
    extends ReactSelectProps<SelectOption>,
        CreatableProps<SelectOption> {
    isCreatable?: boolean;
    msgNoOptionsAvailable?: string;
    msgNoOptionsMatchFilter?: string;
    msgNoValidValue?: string;
}

export interface SelectOption {
    label: string;
    options?: SelectOption[];
    value?: SelectOptionValue;
}

export type SelectOptionValue = any;

export default SelectDropdown;

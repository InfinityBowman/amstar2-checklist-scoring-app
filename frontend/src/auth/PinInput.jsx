import * as pinInput from '@zag-js/pin-input';
import { normalizeProps, useMachine } from '@zag-js/solid';
import { createMemo, createUniqueId } from 'solid-js';

export default function PinInput(props) {
  const service = useMachine(pinInput.machine, {
    id: createUniqueId(),
    required: props.required || true,
    autoComplete: props.autoComplete || 'one-time-code',
    otp: props.otp || true,
    onValueChange(value) {
      if (props.onInput) props.onInput(value.valueAsString);
    },
    onValueComplete(details) {
      if (props.onComplete) props.onComplete(details.valueAsString);
    },
  });

  const api = createMemo(() => pinInput.connect(service, normalizeProps));

  const inputClass = () =>
    'w-10 h-12 sm:w-14 sm:h-14 rounded-lg border-2 ' +
    (props.isError ?
      'border-red-500 focus:border-red-600 focus:ring-red-400'
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-400') +
    ' bg-gray-50 text-center text-xl font-semibold outline-none';

  return (
    <div class="flex flex-col items-center">
      <div {...api().getRootProps()} class="flex justify-center gap-1 sm:gap-3 my-6">
        <input required={props.required ?? true} {...api().getInputProps({ index: 0 })} class={inputClass()} />
        <input required={props.required ?? true} {...api().getInputProps({ index: 1 })} class={inputClass()} />
        <input required={props.required ?? true} {...api().getInputProps({ index: 2 })} class={inputClass()} />
        <input required={props.required ?? true} {...api().getInputProps({ index: 3 })} class={inputClass()} />
        <input required={props.required ?? true} {...api().getInputProps({ index: 4 })} class={inputClass()} />
        <input required={props.required ?? true} {...api().getInputProps({ index: 5 })} class={inputClass()} />
      </div>
    </div>
  );
}

import * as pinInput from "@zag-js/pin-input"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"

export default function PinInput(props) {
  const service = useMachine(pinInput.machine, {
    id: createUniqueId(),
    required: props.required || true,
    autoComplete: props.autoComplete || "one-time-code",
  })

  const api = createMemo(() => pinInput.connect(service, normalizeProps))

  return (
    <div class="flex flex-col items-center">
      {/* Pin Input Boxes */}
      <div
        {...api().getRootProps()}
        class="flex justify-center gap-3 my-6"
      >
        <input
          {...api().getInputProps({ index: 0 })}
          class="w-14 h-14 rounded-lg border-2 border-gray-300 bg-gray-50 text-center text-xl font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-400 outline-none"
        />
        <input
          {...api().getInputProps({ index: 1 })}
          class="w-14 h-14 rounded-lg border-2 border-gray-300 bg-gray-50 text-center text-xl font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-400 outline-none"
        />
        <input
          {...api().getInputProps({ index: 2 })}
          class="w-14 h-14 rounded-lg border-2 border-gray-300 bg-gray-50 text-center text-xl font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-400 outline-none"
        />
        <input
          {...api().getInputProps({ index: 3 })}
          class="w-14 h-14 rounded-lg border-2 border-gray-300 bg-gray-50 text-center text-xl font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-400 outline-none"
        />
        <input
          {...api().getInputProps({ index: 4 })}
          class="w-14 h-14 rounded-lg border-2 border-gray-300 bg-gray-50 text-center text-xl font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-400 outline-none"
        />
        <input
          {...api().getInputProps({ index: 5 })}
          class="w-14 h-14 rounded-lg border-2 border-gray-300 bg-gray-50 text-center text-xl font-semibold focus:border-orange-500 focus:ring-2 focus:ring-orange-400 outline-none"
        />
      </div>

    
    </div>
  )
}

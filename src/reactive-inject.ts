import { InjectKey } from "vue/types/options";
import { createDecorator } from "vue-class-component";

import { REACTIVE_INJECTS_MANAGER, ReactiveInjectOptions, ReactiveInjectVue } from "./interfaces";
import { addComputed, addLifecycleHook, addReactiveInject } from "./utils";

/**
 * @ReactiveInject
 * ---------------
 *
 * Decorator used to mark property for injection of value provided with
 * `@ReactiveProvide` by any ancestor compoonent.
 *
 * @param injectOptions Optional, one of the following:
 * * A string or a symbol representing the provider key to inject.
 * * An object with optional properties:
 *   * `from` matching the provider key
 *   * `default` for setting a fallback value if no value was provided.
 *
 * If no options are passed will the property name be used as provider key.
 */
export function ReactiveInject<T, V extends ReactiveInjectVue<T>>(
	injectOptions?: InjectKey | ReactiveInjectOptions<T>,
) {
	return createDecorator((componentOptions, property) => {
		// We have to register the inject on a different property, so that we can
		// add a computed getter on the correct property name.
		const internalProperty = `__ri-${property}`;

		if (typeof injectOptions === "object" && !injectOptions.from) {
			injectOptions = { ...injectOptions, from: property };
		}

		if (typeof injectOptions === "string" || typeof injectOptions === "symbol") {
			injectOptions = { from: injectOptions };
		}

		if (!injectOptions) {
			injectOptions = { from: property };
		}

		// Register inject on property.
		addReactiveInject<T, V>(componentOptions, internalProperty, injectOptions);

		// Add a computed getter for the property name, proxying to the
		// reactiveComponent set up in `@ReactiveProvide`.
		addComputed<T, V>(componentOptions, property, {
			get(this) {
				const injects = this[REACTIVE_INJECTS_MANAGER];
				const def = (injectOptions as any).default;

				// Get reactive component from internal manager on component, or try the
				// internalProperty name. (Manager won't be set up before `created` Vue
				// lifecycle hook, so internalProperty will not have been moved yet if
				// that is the case.)
				const reactive = injects && injects[property] && injects[property].reactiveComponent
					|| this[internalProperty];

				// Return value of reactive component or fall back to default, then
				// `undefined` if no values could be found.
				return reactive && reactive.value !== undefined && reactive.value
					|| def && (typeof def === "function" ? def.call(this) : def)
					|| undefined;
			},
		});

		// Handle cleanup on "created" lifecycle hook.
		addLifecycleHook<V>(componentOptions, "created", function(this: V) {
			const optionsInject: any = this.$options.inject;

			if (!this[REACTIVE_INJECTS_MANAGER]) {
				this[REACTIVE_INJECTS_MANAGER] = {};
			}

			// Move internal property name and inject options to manager.
			this[REACTIVE_INJECTS_MANAGER][property] = {
				injectOptions: optionsInject[internalProperty],
				reactiveComponent: this[internalProperty],
			};

			delete this[internalProperty];
		});
	});
}

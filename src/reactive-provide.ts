import Vue from "vue";
import { InjectKey } from "vue/types/options";
import { createDecorator } from "vue-class-component";

import { addReactiveProvide, addWatcher } from "./utils";

/**
 * @ReactiveProvide
 * ----------------
 *
 * Makes it possible to decorate class properties for enabling the Vue
 * [provide/inject](https://vuejs.org/v2/api/#provide-inject) pattern in
 * [class-style](https://github.com/vuejs/vue-class-component) components,
 * injecting the property into all descendants decorated with `@ReactiveInject`,
 * while also making the injected values reactive.
 *
 * Warning: Making the provide/inject reactive is certainly not the intended
 * behaviour, and the opposite is in fact stated as the intentional design for
 * Vue. This whole thing can be considered a dirty hack, and was mostly done for
 * educational purposes.
 *
 * Use at your own risk!
 *
 * @param key An optional string or symbol that the provider should register
 * with. If nothing is defined will the property name be used.
 */
export function ReactiveProvide<T, V extends Vue>(key?: InjectKey) {
	return createDecorator((componentOptions, property) => {
		// Register provide and retreive reactive component used for communication.
		const { reactiveComponent }
			= addReactiveProvide<T, V>(componentOptions, property, key);

		// Register watcher on property, passing on the value to reactive component.
		addWatcher<T, V>(
			componentOptions,
			property,
			value => reactiveComponent.value = value,
		);
	});
}

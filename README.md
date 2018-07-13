# (:heavy_exclamation_mark: alpha version) vue-reactive-provide-inject-decorators

> ECMAScript / TypeScript decorators for reactive provide/inject dependency injector for class-style Vue components.

### :warning: Warning

As noted in the [Vue API documentation](https://vuejs.org/v2/api/#provide-inject) is `provide` and `inject` intended for use in advanced plugin / component libraries, and use in generic applications is strongly discouraged. They are also intentionally NOT reactive in the Vue API, and making them reactive is most certainly to be considered a hack.

Also, this code was created for educational purposes, and I have no real ambitions about maintaining the project. In it's current state it **should not** be considered for anything going into production.

### Usage

[vue-class-component](https://github.com/vuejs/vue-class-component/#readme) is the only dependency besides Vue, and it's usage instructions should apply for this project too for the most part, although no Babel support has been added yet. A decent understanding of the internal API for [`provide` / `inject`](https://vuejs.org/v2/api/#provide-inject) in Vue is also recommended.

### Example

**`@ReactiveInject`** is used in descendant components on properties that should get their values injected from an providing ancestor.

```vue
<template>
  <div>
    <h2>Descendant</h2>
    <p>message: {{ message }}</p>
    <p>foo, referencing "some-key" key: {{ foo }}</p>
    <p>default: {{ default }}</p>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { ReactiveInject } from "vue-reactive-provide-inject-decorators";

@Component
export default class Descendant extends Vue {
  @ReactiveInject()
  message!: string;

  @ReactiveInject("some-key")
  foo!: string;

  @ReactiveInject({ default() { return "no value provided"; } })
  default!: string;
}
</script>
```

**`@ReactiveProvide`** is used in ancestor components on properties that should be made available for injection into all descendants.

```vue
<template>
  <div>
    <h1>App</h1>
    <p>
      <input v-model="message">
      {{ message }}
    </p>
    <p>
      <input v-model="foo">
      {{ foo }}
    </p>

    <div>
      <descendant />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { ReactiveProvide } from "vue-reactive-provide-inject-decorators";
import Descendant from "./Descendant.vue";

@Component({
  components: { Descendant },
})
export default class App extends Vue {
  @ReactiveProvide()
  message = "Initial value";

  @ReactiveProvide("some-key")
  foo = null;
}
</script>
```

### Known issues

* [ ] `@ReactiveProvide` must be initialized in order to become reactive.
* [ ] `@ReactiveInject` must NOT be initialized, as "already defined" warnings will show if they are, and no reactivity will take place.
* [ ] There are no tests, and very litt quality assurance is in place.
* [ ] Type safety can be improved a lot.
* [ ] Caveats outlined in [vue-class-component](https://github.com/vuejs/vue-class-component#caveats-of-class-properties) also applies here.

### License

[MIT](http://opensource.org/licenses/MIT)

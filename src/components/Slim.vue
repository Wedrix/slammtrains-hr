/*
 * Slim v5.1.2 - Image Cropping Made Easy
 * Copyright (c) 2019 Rik Schennink - https://pqina.nl/slim
 */
<template>
    <div class="slim">
        <slot></slot>
    </div>
</template>

<script>
  // Slim (place slim CSS and slim.module.js file in same folder as this file)
  import Slim from '@/assets/slim.module';

  export default {
    props: ['options','initialImage','disabledInput'],
    name: 'slim-cropper',
    data() {
        return {
            slimInstance: null,
        };
    },
    mounted() {
      this.initialize();
    },
    methods: {
      initializeSlim() {
        this.slimInstance = new Slim(this.$el, this.options);

        if (this.disabledInput) {
          this.disableInputs();
        }
      },
      disableInputs() {
        const inputs = this.$el.getElementsByTagName('input');
        
        for (const input of inputs) {
          input.setAttribute('disabled','');
        }
      },
      setInitialImage() {
        const imgElements = this.$el.getElementsByTagName('img');
        
        for (let i = 0; i < imgElements.length; i++) {
          imgElements[i].remove();
        }

        if (this.initialImage) {
          let img = document.createElement('img');
          img.setAttribute('alt', '');
          img.src = this.initialImage;
          this.$el.appendChild(img);
        }
      },
      initialize() {
        this.setInitialImage();
        this.initializeSlim();
      },
      reinitialize() {
        this.slimInstance.destroy();
        this.initialize();
      }
    },
    watch: {
      options: {
        deep:true,
        handler(newOptions) {
          this.slimInstance.setRatio(newOptions.ratio);
        },
      },
      initialImage(newInitialImage) {
        if (newInitialImage) {
          this.reinitialize();
        }
      }
    },
  }
</script>

<style lang="css">
    @import "../assets/slim.min.css";
</style>
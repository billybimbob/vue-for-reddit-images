<script>
import Gallery from './Gallery';

export default {
    mixins: [Gallery],
    data() {
        return {
            lazy: {
                observer: null,
                watchAmnt: 5
            }
        }
    },

    methods: {
        newLoadInfo: () => ({
            style: {maxHeight: '100%', haxWidth: '100%'},
            render: false,
            show: false
        }),

        observeImages() {
            if (this.lazy.observer && this.getImages()) {
                this.getImages()
                    .map(image => image.$el) //assume el has a data-id attr
                    .map(el => ({el, info: this.loadInfo[el.dataId]}))
                    //.map(el => ({ el, info: this.loadInfo[el.dataset.id] }))
                    .filter(({info}) => !info.render)
                    .forEach(({el}) => {
                        this.lazy.observer.observe(el);
                    });
            } else {
                Object.values(this.loadInfo).forEach(info => {
                    info.render = true;
                });
            }   
        }
    },

    created() {
        if ('IntersectionObserver' in window) { //add lazy loading
            this.lazy.observer = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.intersectionRatio > 0) {
                        const id = entry.target.dataId;
                        this.loadInfo[id].render = true;
                        observer.unobserve(entry.target);
                    }
                });
            }, {threshold: 0.3});
        }
    },
    mounted() {
        this.observeImages();
    },

    updated() {
        this.observeImages()
    },

    beforeDestroy() {
        if (this.lazy.observer) {
            this.lazy.observer.disconnect();
        }
    }
}
</script>
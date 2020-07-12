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
            const images = this.getImages();
            if (this.lazy.observer && images) {
                images.map(image => image.$el) //assume el has a dataId attr
                    //.map(el => ({el, info: this.loadInfo[el.dataId]}))
                    //.map(el => ({ el, info: this.loadInfo[el.dataset.id] }))
                    //.filter(({ info }) => !info.render)
                    .forEach((el) => {
                        //too many observers? maybe limit amount
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
        if ('IntersectionObserver' in window) { //add lazy loading if can
            this.lazy.observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {

                    const info = this.getInfo(entry.target);
                    if (entry.isIntersecting) {
                        if (info.render) {
                            info.show = true;
                        } else {
                            info.render = true;
                        }
                        //observer.unobserve(entry.target);
                    } else if (info.show) {
                        info.show = false;
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
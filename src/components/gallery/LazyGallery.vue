<script>
import Gallery from './Gallery';

export default {
    mixins: [Gallery],
    data() {
        return {
            observer: null
        }
    },

    methods: {
        newLoadInfo: () => ({
            style: {maxHeight: '100%', haxWidth: '100%'},
            render: false,
            show: false,
            //loaded: false //used only internally
        }),

        observeImages() {
            const images = this.getImages();
            if (this.observer && images) {
                images
                    .map(image => image.$el)
                    .map(el => (
                        { el, info: this.nodeInfo(el) }))
                    .filter (({ info }) => !info.render)
                    .forEach(({ el }) => {
                        this.observer.observe(el);
                    });
            } else if (!this.observer) {
                Object.values(this.loadInfo).forEach(info => {
                    info.render = true;
                });
            }   
        }
    },

    created() {
        if ('IntersectionObserver' in window) { //add lazy loading if can
            this.observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    const intersect = entry.isIntersecting;
                    const info = this.nodeInfo(entry.target);

                    if (!info || (info && info.render)) { //posts all change
                        observer.unobserve(entry.target);
                    } else if (intersect) {
                        info.render = true;
                        observer.unobserve(entry.target);
                    }
                    /*else if (info.show) {
                        info.loaded = true; //never set back to false
                    }
                    
                    if (intersect && !info.render) {
                        info.render = true;
                    } else if (intersect && info.loaded && !info.show) {
                        info.show = true;
                    } else if (!intersect && info.loaded) {
                        info.show = false;
                    }*/
                });
            }, {threshold: 0.25});
        } else {
            console.log('cannot use intersection observer')
        }
    },
    mounted() {
        this.observeImages();
    },

    updated() {
        this.observeImages()
    },

    beforeDestroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}
</script>
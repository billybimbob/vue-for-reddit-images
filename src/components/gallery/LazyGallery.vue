<script>
import Gallery from './Gallery';

export default {
    mixins: [Gallery],
    data() {
        return {
            observer: null,
            watchAmnt: 5
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
            if (this.observer && images) {
                images.map(image => image.$el)
                    .forEach((el) => {
                        //too many observers? maybe limit amount
                        this.observer.observe(el);
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
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    const intersect = entry.isIntersecting;
                    const info = this.getInfo(entry.target);

                    if (!info) { //posts all change, maybe add to beforeUpdate?
                        return;
                    } else if (intersect && !info.render) {
                        info.render = true;
                    } else if (intersect && info.render) {
                        info.show = true;
                    } else if (info.show) {
                        info.show = false;
                    }
                });
            }, {threshold: 0.25});
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
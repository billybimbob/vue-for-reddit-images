
var app = new Vue({
    el: "#app",
    data: {
        message: "Test drawing",
        painting: false,
        ctx: null
    },
    methods: {
        startPaint(event) {
            this.painting = true;
            this.draw(event);
        },

        finishPaint() {
            this.painting = false;
            this.ctx.beginPath();
        },

        draw(event) {
            if (!this.painting) return;

            this.ctx.lineWidth = 10;
            this.ctx.lineCap = "round";

            this.ctx.lineTo(event.clientX, event.clientY);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(event.clientX, event.clientY);
        }
    },
    mounted() {
        let canvas = document.getElementById('canvas');
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;

        this.ctx = canvas.getContext('2d');
    }
})
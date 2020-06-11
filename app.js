
var app = new Vue({
    el: "#app",
    data: {
        message: "Test drawing",
        painting: false,
        canvas: null,
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
        this.canvas = document.getElementById('canvas');
        this.ctx = canvas.getContext('2d');

        this.canvas.height = window.innerHeight;
        this.canvas.width = window.innerWidth;
    }
})
<template>
    <div class="filters">
        <div class="selects">
            <select :value="order" @change="orderChange" class="sortSelect">
                <option v-for="(option, i) in sortBy"
                    :value="option.name" :key="option.name" >
                    {{ sortNames[i] }}
                </option>
            </select>

            <select v-if="timed" :value="time" @change="timeChange" class="sortSelect">
                <option v-for="(interval, i) in times"
                    :value="interval" :key="interval" >
                    {{ timeNames[i] }}
                </option>
            </select>
        </div>

        <form name="orderBy" @submit.prevent="setSubName">
            <input v-model="newsubname" placeholder="Enter subreddit name"
                @focus.prevent="focusSearch" @blur.prevent="blurSearch"
                :class="['searchTerm', {'searching': userIs.searching}]">

            <img :src="svgs.searchBlack"  @click="setSubName"
                :class="['searchButton', {'searching': userIs.searching}]"/>
        </form>

        <div class="checkboxes">
            <img :src="svgs.leftArrow" @click="revealChecks"
                :class="['revealer', {'checking': userIs.checking}]"/>

            <div class="options" v-show="userIs.checking">
                <input type="checkbox" id="autoload" :value="autoload" @change="autoChange"/>
                <label for="autoload">Infinite Scroll</label>

                <input type="checkbox" id="slideshow" :checked="slideshow" @change="showChange"/>
                <label for="slideshow">Slideshow</label>
            </div>
        </div>
    </div>
</template>


<script>
import searchBlack from '../assets/search-black.svg';
import leftArrow from '../assets/left-arrow.svg';

export default {
    data() {
        return {
            newsubname: "",
            sortBy: [
                {name: 'hot', timed: false},
                {name: 'top', timed: true},
                {name: 'new', timed: false},
                {name: 'controversial', timed: true},
                {name: 'rising', timed: false}
            ],
            times: ['hour', 'day', 'week', 'month', 'year', 'all'],
            userIs: { //user action state
                entered: false,
                searching: false,
                checking: false
            },
            svgs: {
                leftArrow,
                searchBlack
            }
        };
    },
    props: {
        subreddit: String,
        order: String,
        time: String,
        autoload: Boolean,
        slideshow: Boolean
    },
    computed: {
        sortNames() {
            return this.sortBy.map(order => order.name
                .charAt(0).toUpperCase()
                .concat(order.name.slice(1).toLowerCase())
            );
        },
        timeNames() {
            return this.times.map(time => time
                .charAt(0).toUpperCase()
                .concat(time.slice(1).toLowerCase())
            );
        },
        timed() {
            const orderIdx = this.sortBy
                .map(order => order.name)
                .indexOf(this.order);
            return this.sortBy[orderIdx].timed;
        }
    },

    methods: {
        focusSearch() {
            if (this.userIs.entered) {
                this.newsubname = "";
                this.userIs.entered = false;
            }
            this.userIs.searching = true;
        },
        blurSearch() {
            this.userIs.searching = false;
        },

        revealChecks() {
            this.userIs.checking = !this.userIs.checking;
        },

        orderChange(event) {
            this.$emit('update:order', event.target.value);
        },
        timeChange(event) {
            this.$emit('update:time', event.target.value);
        },
        setSubName() {
            //console.log("old name: " + this.subreddit, " new name: " + this.newsubname);
            console.log(this.newsubname);
            this.$emit('update:subreddit', this.newsubname);
            this.userIs.entered = true;
        },
        autoChange() {
            this.$emit('update:autoload', !this.autoload);
        },
        showChange() {
            this.$emit('update:slideshow', !this.slideshow);
        }
    }
}
</script>


<style scoped>
.filters {
    width: 99%;
    font-size: 20px;
    padding: 15px 0px;
    display: inline-flex;
    justify-content: space-between;
}

.filters form {
    display: flex;
    align-items: center;
}

.searchTerm {
    border: none;
    border-bottom: 2px solid #6f7887;
    padding: 12px;
    padding-left: 4px;
    height: 8px;
    outline: none;
    color: #6f7887;
    background-color: transparent;
    font-size: 18px;
    transition: all 0.25s ease-in;
}

.searchTerm.searching {
    transform: scale(1.04);
    border-color: black;
}

.searchButton {
    margin-top: 6px;
    margin-left: 5px;
    transition: transform 0.25s ease-in;
    cursor: pointer;
    background-color: transparent;
    border: none;
}

.searchButton.searching {
    transform: scale(1.2);
}

.sortSelect {
    background: #6f7887;
    color: white;
    text-align: center;
    bottom: 2px;
    border: 0px solid #6f7887;
    width: auto;
    height: 44px;
}

.checkboxes {
    margin: auto 0;
    display: flex;
}
.revealer {
    transition: transform 0.25s ease-in;
    cursor: pointer;
    background-color: transparent;
    border: none;
    height: 30px;
    width: 30px;
}

.revealer.checking {
    transform: rotate(-180deg);
}

.checkboxes .options {
    margin: auto 0;
}

.checkboxes .options label {
    margin-right: 8px;
}
</style>

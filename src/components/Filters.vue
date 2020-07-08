<template>
    <div class="topDiv">
        <select :value="order" @change="orderChange" class="sortSelect">
            <option v-for="(option, i) in sortBy"
                :value="option.name" :key="option.name"
            >
                {{ sortNames[i] }}
            </option>
        </select>

        <select v-if="timed" :value="time" @change="timeChange" class="sortSelect">
            <option v-for="(interval, i) in times"
                :value="interval" :key="interval"
            >
                {{ timeNames[i] }}
            </option>
        </select>

        <form name="orderBy" @submit.prevent="setSubName">
            <input v-model="newsubname" placeholder="Enter subreddit name" class="searchTerm">
            <button @click="setSubName" form="orderBy" type="submit" class="searchButton">Go</button>
        </form>
    </div>
</template>


<script>
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
            times: ['hour', 'day', 'week', 'month', 'year', 'all']
        };
    },
    props: {
        subreddit: String,
        order: String,
        time: String
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
        orderChange(event) {
            //console.log(event.target.value)
            this.$emit('update:order', event.target.value);
        },
        timeChange(event) {
            this.$emit('update:time', event.target.value);
        },
        setSubName() {
            //console.log("old name: " + this.subreddit, " new name: " + this.newsubname);
            console.log(this.newsubname);
            this.$emit('update:subreddit', this.newsubname);
        }
    }
}
</script>


<style scoped>
.topDiv {
    font-size: 20px;
    font-family: sans-serif;
    padding: 20px 0px;
}

.searchTerm {
    border: 3px solid #6f7887;
    padding: 15px;
    height: 8px;
    border-right: none;
    outline: none;
    color: #9DBFAF;
    font-size: 18px;
    font-family: Arial;
}

.searchButton {
    height: 44px;
    border: 0px solid #6f7887;
    background: #6f7887;
    color: #fff;
    font-size: 20px;
}

.sortSelect {
    font-family: Arial;
    background: #6f7887;
    text-align: center;
    bottom: 2px;
    border: 0px solid #6f7887;
    width: auto;
    height: 44px;
}

button {
  cursor: pointer;
}
</style>

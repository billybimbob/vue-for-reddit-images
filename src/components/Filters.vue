<template>
    <div class="topDiv">
        <select :order="order" @input="orderChange" class="sortSelect">
            <option v-for="(option, i) in sortBy" :value="option" :key="option">
            {{ sortNames[i] }}
            </option>
        </select>

        <form name="orderBy" @submit.prevent="setSubName">
            <input v-model="newsubname" placeholder="Enter subreddit name" class="searchTerm">
        </form>
        <button form="orderBy" type="submit" @click="setSubName" class="searchButton">Go</button>
    </div>
</template>


<script>
export default {
    data() {
        return {
            newsubname: "",
            sortBy: ['hot', 'top', 'new', 'controversial']
        };
    },
    props: {
        subreddit: String,
        order: String,
        options: Object
    },
    computed: {
        sortNames() {
            return this.sortBy.map(order => order
                .charAt(0).toUpperCase()
                .concat(order.slice(1).toLowerCase()),
            )
        }
    },

    methods: {
        orderChange(event) {
            //console.log(event.target.value)
            this.$emit('update:order', event.target.value);
        },
        setSubName() {
            //console.log("old name: " + this.subreddit, " new name: " + this.newsubname);
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

.topDiv * {
    display: inline-block;
    vertical-align: top;
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
    width: 45px;
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
</style>

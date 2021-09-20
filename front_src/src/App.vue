<template>
  <router-view></router-view>
</template>

<script>
export default {
  mounted() {
    if (!this.$store.state.authenticated) {
      this.$router.push('/login')
    }
  }
}
</script>
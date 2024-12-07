const pokeContainer = document.querySelector('bicho-dex')
const tot_bicho = 1
const fetchBicho = async() => {
    for (let i = 0 ; i < tot_bicho; i++) {
        await getPokemons(i)
    }
}


const mainType = Object.keys(colors)
    const animals = async (id) => {
    const url = `google.com`
    const resp = await fetch(url)
    const data =  await resp.json()
    

    console.log(data)

}

fetchBicho()
window.addEventListener('load', async()=>{
    const searchParams = new URLSearchParams(location.search);
    const groupID = searchParams.get('groupID')

    if (groupID){
        const res = await fetch(`groups/group-detail?groupID=${groupID}`)
        const result = await res.json()
        console.log(result)
    }
})
import api from "."

export const match = async (id: string) => {
    try {
        const res = await api.post('/v1/match/', {
            id
        })

        return res.data
    } catch (error) {

    }

}

export const getMatches = async ()=>{
    try{
        const res = await api.get('v1/match/')

        console.log('matches: ', res.data.matches[0])
        return res.data

    }catch(error){

    }
}
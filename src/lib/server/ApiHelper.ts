export  class SearchRange {
    fillResponseInfo(body = {}, totalLength: number) {
        body["first"]=this.first
        body["page"]=this.page
        body["maxPage"]=Math.ceil(totalLength/this.range)
        body["results"]=totalLength
        }
    constructor(public page = 0, public range=10){

    }


    public get first()  {
        return this.page*this.range
    }
    public get last()  {
        return ((this.page+1)*this.range)
    }

    public fromUrl(url:URL){
        if (url.searchParams.has("page")) {
            try{
                this.page = parseInt(url.searchParams.get("page"))
            } catch{
                console.error("Wrong conversion, keep default")
            }
        }
        if (url.searchParams.has("range")) {
            try{
                this.range = parseInt(url.searchParams.get("range"))
            } catch{
                console.error("Wrong conversion, keep default")
            }
        }

    }



}

export function httpErr404(msg="Not found",request={}){
    return {
        status:404,
        body:{
            msg:msg,
            req:request
        }
    }
}

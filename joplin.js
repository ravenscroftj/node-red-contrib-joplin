const Axios = require('axios');

module.exports = function(RED) {
    function JoplinCreateNode(config) {
        RED.nodes.createNode(this,config);

        this.noteBody = config.noteBody;
        this.title = config.title;
        this.server = RED.nodes.getNode(config.server);
    
        const apiKey = this.server.credentials.apiKey;
        const {hostname, port} = this.server;

        var node = this;
        node.on('input', async function(msg) {

            let {title, noteBody} = this;
            let data = {title,noteBody, ...msg.payload};

            try{
                const response = await Axios.post(`http://${hostname}:${port}/notes`,{data})
                msg.payload = response.data;
                node.send(msg);
            }catch(error){
                node.error(error);
            }
            
        });
    }
    RED.nodes.registerType("joplin-create",JoplinCreateNode);

    function JoplinSearchNode(config) {
        RED.nodes.createNode(this,config);

        this.query= config.query;
        this.server = RED.nodes.getNode(config.server);
    
        const token = this.server.credentials.apiKey;
        const {hostname, port} = this.server;

        var node = this;
        node.on('input', async function(msg) {

            let {query} = this;

            let params = {query,token, ...msg.payload};

            if(!params.query){
                node.error("You must set a query either in the node options or via msg.payload.");
                return;
            }

            try{
                node.error(params);
                const response = await Axios.get(`http://${hostname}:${port}/search`, {params});
                msg.payload = response.data;
                node.send(msg);
            }catch(error){
                node.error(error);
            }

        });
    }
    RED.nodes.registerType("joplin-search",JoplinSearchNode);
    

    function JoplinGetResourceNode(config) {
        RED.nodes.createNode(this,config);

        this.id= config.id;
        this.resourceType = config.resourceType;
        this.fields = config.fields;
        this.server = RED.nodes.getNode(config.server);
    
        const token = this.server.credentials.apiKey;
        const {hostname, port} = this.server;

        var node = this;
        node.on('input', async function(msg) {


            const id = msg.payload.id ? msg.payload.id : this.id;
            const type = msg.payload.resourceType ? msg.payload.resourceType: this.resourceType; 
            const fields = msg.payload.fields ? msg.payload.fields : this.fields;

            try{
                node.log(`http://${hostname}:${port}/${type}/${id}`);
                const response = await Axios.get(`http://${hostname}:${port}/${type}/${id}`, {"params":{token,fields}});
                msg.payload = response.data;
                node.send(msg);
            }catch(error){
                node.error(error);
            }

        });
    }
    RED.nodes.registerType("joplin-get",JoplinGetResourceNode);

    function JoplinConfigNode(n) {
        RED.nodes.createNode(this,n);
        this.hostname = n.hostname;
        this.port = n.port;
    }

    RED.nodes.registerType("joplin-config",JoplinConfigNode, {
        credentials:{
            apiKey: {type:"text"}
        }
    });
}

const Axios = require('axios');

module.exports = function(RED) {
    /**
     * JoplinCreateNode for creating new joplin resources via API
     * 
     * @param {object} config 
     */
    function JoplinCreateNode(config) {
        RED.nodes.createNode(this,config);

        this.noteBody = config.noteBody;
        this.title = config.title;
        this.parentId = config.parentId;
        this.server = RED.nodes.getNode(config.server);
    
        const apiKey = this.server.credentials.apiKey;
        const {hostname, port} = this.server;

        var node = this;
        node.on('input', async function(msg) {

            let {title, noteBody, parentId} = this;
            let data = {title,body:noteBody, parent_id: parentId, ...msg.payload};


            try{
                const response = await Axios.post(`http://${hostname}:${port}/notes`,data,{params:{token:apiKey}});

                msg.payload = response.data;
                node.send(msg);
            }catch(error){
                node.error(error);
            }
            
        });
    }
    RED.nodes.registerType("joplin-create",JoplinCreateNode);

    /**
     * JoplinDeleteNode for removing existing joplin resources via API
     * 
     * @param {object} config 
     */
    function JoplinDeleteNode(config) {
        RED.nodes.createNode(this,config);

        this.resourceId  = config.resourceId;
        this.resourceType = config.resourceType;
        this.server = RED.nodes.getNode(config.server);
    
        const apiKey = this.server.credentials.apiKey;
        const {hostname, port} = this.server;

        var node = this;
        node.on('input', async function(msg) {

            let resourceType = msg.payload.resourceType || this.resourceType;
            const id = msg.payload.resourceId || this.resourceId;

            if(!id){
                node.error("No ID was provided for Joplin resource delete");
                return;
            }

            try{
                const response = await Axios.delete(`http://${hostname}:${port}/${resourceType}/${id}`,{params:{token:apiKey}});

                msg.payload = response.data;
                node.send(msg);
            }catch(error){
                node.error(error);
            }
            
        });
    }
    RED.nodes.registerType("joplin-delete",JoplinDeleteNode);

    /**
     * JoplinUpdateNode for updating existing joplin resources via API
     * 
     * @param {object} config 
     */
    function JoplinUpdateNode(config) {
        RED.nodes.createNode(this,config);

        this.resourceId  = config.resourceId;
        this.noteBody = config.noteBody;
        this.title = config.title;
        this.server = RED.nodes.getNode(config.server);
    
        const apiKey = this.server.credentials.apiKey;
        const {hostname, port} = this.server;

        var node = this;
        node.on('input', async function(msg) {

            let {title, noteBody} = this;
            let data = {title,body:noteBody, ...msg.payload};
            let resourceType = msg.payload.resourceType || "notes";
            const id = msg.payload.resourceId || this.resourceId;

            if(!id){
                node.error("No ID was provided for Joplin resource update");
                return;
            }

            try{
                const response = await Axios.put(`http://${hostname}:${port}/${resourceType}/${id}`,data,{params:{token:apiKey}});

                msg.payload = response.data;
                node.send(msg);
            }catch(error){
                node.error(error);
            }
            
        });
    }
    RED.nodes.registerType("joplin-update",JoplinUpdateNode);


    /**
     * JoplinSearchNode for finding joplin resources via the API
     * 
     * @param {object} config 
     */
    function JoplinSearchNode(config) {
        RED.nodes.createNode(this,config);

        this.query= config.query;
        this.fields = config.fields;
        this.server = RED.nodes.getNode(config.server);
    
        const token = this.server.credentials.apiKey;
        const {hostname, port} = this.server;

        var node = this;
        node.on('input', async function(msg) {

            let {query,fields} = this;

            let params = {query,token,fields, ...msg.payload};

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
    
    /**
     * JoplinGetResourceNode for retrieving specific resources by ID from the API
     * 
     * @param {object} config 
     */
    function JoplinGetResourceNode(config) {
        RED.nodes.createNode(this,config);

        this.resourceId= config.resourceId;
        this.resourceType = config.resourceType;
        this.fields = config.fields;
        this.server = RED.nodes.getNode(config.server);
    
        const token = this.server.credentials.apiKey;
        const {hostname, port} = this.server;

        var node = this;
        node.on('input', async function(msg) {


            const id = msg.payload.resourceId ? msg.payload.resourceId : this.resourceId;
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

    /**
     * JoplinGetResourceNode for retrieving specific resources by ID from the API
     * 
     * @param {object} config 
     */
    function JoplinGetByParentResourceNode(config) {
        RED.nodes.createNode(this,config);

        this.resourceParentId = config.resourceParentId;
        this.resourceParentType = config.resourceParentType;
        this.resourceType = config.resourceType;

        //this.fields = config.fields;
        this.server = RED.nodes.getNode(config.server);
    
        const token = this.server.credentials.apiKey;
        const {hostname, port} = this.server;

        var node = this;
        node.on('input', async function(msg) {


            const id = msg.payload.resourceParentId  ? msg.payload.resourceParentId  : this.resourceParentId;
            const parentType = msg.payload.resourceParentType ? msg.payload.resourceParentType: this.resourceParentType; 
            const type = msg.payload.resourceType ? msg.payload.resourceType: this.resourceType; 
            //const fields = msg.payload.fields ? msg.payload.fields : this.fields;

            try{
                const response = await Axios.get(`http://${hostname}:${port}/${parentType}/${id}/${type}`, {"params":{token}});
                msg.payload = response.data;
                node.send(msg);
            }catch(error){
                node.error(error);
            }

        });
    }
    RED.nodes.registerType("joplin-getby-parent",JoplinGetByParentResourceNode);

    /**
     * JoplinConfigNode use to define location of specific joplin servers (and credentials)
     * 
     * @param {object} n 
     */
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

    const listNotebooks = async (server) => {

        const response = await Axios.get(`http://${server.hostname}:${server.port}/folders`, {params:{token:server.credentials.apiKey}});
        console.log(response.data);
        return response.data
    };

    RED.httpAdmin.get('/joplin/:cmd/:config_node_id', async (req, res) => {

        var configNode = RED.nodes.getNode(req.params.config_node_id);

        switch(req.params.cmd){
            case 'list-notebooks':
                res.json(await listNotebooks(configNode));

        }

    });
}

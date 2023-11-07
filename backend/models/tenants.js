const mongoose = require(`mongoose`)
const tenantsSchema =new mongoose.Schema(
    {
        tenant_id:{
            type: String
        },
        tenant_name:{
            type: String
        },
        tenant_emailId:{
            type: String,
        },
        tenant_password:{
            type: String
        },
        tenant_phoneNumber:{
            type: String
        },
        epicx_tenantId:{
            type: String
        },
        dbConnectionString:{
            type: String
        },
        site_URL:{
            type: String
        },
        plan:{
            type: String
        }
        
    },
    {
        timestamps: true
    }
);

const epicx_tenants = mongoose.model('tenant', tenantsSchema );
module.exports = epicx_tenants;
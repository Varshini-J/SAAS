const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser'); 
const cors = require('cors')
const app = express();


// const mongoURI = 'mongodb+srv://admin:Admin123@review-app-db.7srcl1f.mongodb.net/epicx?retryWrites=true&w=majority';
const mongoURI ='mongodb+srv://epicx-admin:hwZnB5vGjlXybzZt@epicx.inktblw.mongodb.net/epicx?retryWrites=true&w=majority'
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
const port = process.env.PORT || 8000; 
app.listen(port, 'localhost', () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const Tenant = require('./models/tenants');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use("*",cors({
    origin:true,
    credentials:true,
}));

// Create a new tenant
app.post('/tenants', async (req, res) => {
  console.log(req.body);
  try {
    const existingTenant = await Tenant.findOne({ tenant_emailId: req.body.tenant_emailId });
    
    if (existingTenant) {
      return res.status(400).json({ message: 'User with the same email already exists.' });
    }
    
    const tenantCount = await Tenant.countDocuments();
    // console.log('tenantCount:', tenantCount);
    const nextTenantId = tenantCount + 1;
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().substring(0, 10); // Format: YYYY-MM-DD
    const epicx_tenantId = `epicx${req.body.tenant_name}${formattedDate}`;
        
    app.get('/tenants/latest-tenant-id', async (req, res) => {
      try {
        const latestTenant = await Tenant.findOne({}, {}, { sort: { 'tenant_id': -1 } });
        if (latestTenant) {
          const latestTenantId = parseInt(latestTenant.tenant_id);
          const nextTenantId = latestTenantId + 1;
          res.status(200).json({ nextTenantId });
        } else {
          res.status(200).json({ nextTenantId: 1 });
        }
      } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });
    const dbConnectionString = `mongodb://localhost/${nextTenantId}`;
    const emailId = `${req.body.tenant_emailId}`;
    console.log(emailId);
    const tenantDb = mongoose.connection.useDb(epicx_tenantId);
    
    // const categorySchema = new mongoose.Schema({
    // });
    // const CategoryModel = tenantDb.model('category', categorySchema);
    // const newCategoryModel = new CategoryModel({
    // });
    // const subcategorySchema = new mongoose.Schema({
    // });
    // const SubcategoryModel = tenantDb.model('subcategory', subcategorySchema);
    // const newSubcategoryModel = new SubcategoryModel({
    // });
    // const productSchema = new mongoose.Schema({
    // });
    // const ProductModel = tenantDb.model('product', productSchema);
    // const newProductModel = new ProductModel({
    // });
  // Define schema options with _id set to false
const schemaOptions = {
  _id: false,
};

// Create models for different collections with the schema options
const CategoryModel = tenantDb.model('category', {}, 'category', schemaOptions);
const newCategoryModel = new CategoryModel();

const SubcategoryModel = tenantDb.model('subcategory', {}, 'subcategory', schemaOptions);
const newSubcategoryModel = new SubcategoryModel();

const ProductModel = tenantDb.model('product', {}, 'product', schemaOptions);
const newProductModel = new ProductModel();

const ReactionModel = tenantDb.model('reaction', {}, 'reaction', schemaOptions);
const newReactionModel = new ReactionModel();

const ProductReviewModel = tenantDb.model('productreview', {}, 'productreview', schemaOptions);
const newProductReviewModel = new ProductReviewModel();

const SiteReviewModel = tenantDb.model('sitereview', {}, 'sitereview', schemaOptions);
const newSiteReviewModel = new SiteReviewModel();
    
      const Register = new Tenant({
      tenant_id: nextTenantId.toString(), 
      tenant_name: req.body.tenant_name,
      tenant_emailId: req.body.tenant_emailId,
      tenant_password: req.body.tenant_password,
      tenant_phoneNumber: req.body.tenant_phoneNumber,
      epicx_tenantId: epicx_tenantId,
      dbConnectionString: dbConnectionString,
      site_URL: req.body.site_URL,
      plan:req.body.plan,
    });

    const savedCategoryModel = await newCategoryModel.save();
    const savedRegister = await Register.save();
    const savedReactionModel = await newReactionModel.save();
    const savedProductReviewModel = await newProductReviewModel.save();
    const savedSiteReviewModel = await newSiteReviewModel.save();


    const savedSubcategoryModel = await newSubcategoryModel.save();
    const savedProductModel = await newProductModel.save();
    const result =[savedCategoryModel, savedRegister, savedSubcategoryModel,savedProductModel,savedReactionModel,savedProductReviewModel,savedSiteReviewModel];  
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Get all tenants
app.get('/tenants', async (req, res) => {
  try {
    const tenants = await Tenant.find();
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ error: 'Could not retrieve tenants' });
  }
});
// Get a single tenant by ID
app.get('/tenants/:id', async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ error: 'Could not retrieve tenant' });
  }
});

// Update a tenant by ID
app.put('/tenants/:id', async (req, res) => {
  try {
    const updatedTenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    if (!updatedTenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    res.json(updatedTenant);
  } catch (error) {
    res.status(500).json({ error: 'Could not update tenant' });
  }
});

// Delete a tenant by ID
app.delete('/tenants/:id', async (req, res) => {
  try {
    const deletedTenant = await Tenant.findByIdAndRemove(req.params.id);
    if (!deletedTenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    res.json({ message: 'Tenant deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Could not delete tenant' });
  }
});
//tenants login into dashboard
// app.post('/login', async (req, res) => {
//   const { tenant_emailId, tenant_password } = req.body;

//   try {
//     const tenant = await Tenant.findOne({ tenant_emailId });

//     if (!tenant) {
//       return res.status(401).json({ message: 'Tenant not found' });
//     }
//     if (tenant.tenant_password !== tenant_password) {
//       return res.status(401).json({ message: 'Invalid password' });
//     }
//     res.status(200).json({ status: 200, message: 'Login successful' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// Login API
app.post('/login', async (req, res) => {
  const { tenant_emailId, tenant_password } = req.body;

  try {
    const tenant = await Tenant.findOne({ tenant_emailId });

    if (!tenant) {
      return res.status(401).json({ message: 'Tenant not found' });
    }

    if (tenant.tenant_password !== tenant_password) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // If login is successful, send back the epicx_tenantId
    res.status(200).json({ status: 200, message: 'Login successful', epicx_tenantId: tenant.epicx_tenantId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

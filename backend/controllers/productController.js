import { sql } from "../config/db.js";
// make CRUD functions
export const getProducts=async(req,res)=>{
    try {
       const products= await sql `
        SELECT * FROM products ORDER BY created_at DESC
        ` ;
        console.log("Fetched Products",products)
        res.status(200).json({success: true,data:products});
    } catch (error) {
        console.log("Error getProducts",error) ;
        res.status(500).json({success: false, message: 'Internal Server Error'});  
    }
}

export const createProduct=async(req,res)=>{
   const {name,price,image}=req.body
   if(!name || !price || !image){
    return res.status(400).json({success:false,message:"All fields are  required"})
   }
   try {
      const newProduct= await sql`INSERT INTO products(name,price,image) VALUES(${name},${price},${image}) RETURNING *` ;
      console.log("Created Product",newProduct);
      res.status(201).json({success: true,data:newProduct[0]});
   } catch (error) {
    console.log("Error in create product",error) ;
        res.status(500).json({success: false, message: 'Internal Server Error'});  
   }
}

export const getProduct=async(req,res)=>{
    const {id}=req.params;
    try {
      const product=  await sql`SELECT * FROM products where id=${id}`;
      res.status(200).json({success:true,data:product[0]})
    } catch (error) {
        console.log("Error in getProduct Function",error);
        res.status(500).json({success:false,message:"Internal Server Error"})
    }
}

export const updateProduct=async(req,res)=>{
    const {id}=req.params;
    const {name,price,image}=req.body;
    try {
       const updateProduct= await sql `UPDATE products SET name=${name},price=${price},image=${image} where id=${id} RETURNING *`;
       if(updateProduct.length===0){
        return res.status(404).json({
            success:false,
            message:"Product not Found"
        })
       }
       res.status(200).json({success:true,data:updateProduct[0]});
        
    } catch (error) {
        console.log("Error in Update Product",error);
        res.status(500).json({success:false,message:"Internal Server Error"})
    }
}

export const deleteProduct=async(req,res)=>{
    const {id}=req.params;
    try {
        const deleteProduct=await sql `DELETE FROM products where id=${id} RETURNING *`;

        // check if the product is deleted or not 
        if (deleteProduct.length===0){
            return res.status(404).json({
                success:false,
                message:"Product not Found"
            })
        }
        res.status(200).json({success:true,data:deleteProduct[0]})
    } catch (error) {
        console.log("Error in Delete Product Function",error)
        res.status(500).json({success:false,message:"Internal Server Error"})
    }
}
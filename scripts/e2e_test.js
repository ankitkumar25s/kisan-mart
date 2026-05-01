(async()=>{
  const base='http://localhost:4000/api';
  try{
    const lr=await fetch(base+'/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({mobile:'9876543210',password:'kisan123'})});
    const ltxt=await lr.text();
    console.log('LOGIN:',ltxt);
  }catch(e){console.error('LOGIN ERR',e)}

  try{
    await fetch(base+'/cart',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({mobile:'9876543210',productId:1,quantity:2})});
    console.log('ADD CART: OK');
  }catch(e){console.error('ADD CART ERR',e)}

  try{
    const cr=await fetch(base+'/cart?mobile=9876543210');
    const ctxt=await cr.text();
    console.log('CART:',ctxt);
  }catch(e){console.error('CART ERR',e)}

  try{
    const or=await fetch(base+'/orders',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({mobile:'9876543210',address:{village:'Sehore',city:'Sehore',state:'Madhya Pradesh',pincode:'466001',mobile:'9876543210'},paymentMethod:'cod'})});
    const ot=await or.text();
    console.log('ORDER:',ot);
    try{
      const oid=JSON.parse(ot).orderId;
      const tr=await fetch(base+'/track/'+encodeURIComponent(oid));
      console.log('TRACK:',await tr.text());
    }catch(e){console.error('TRACK ERR',e)}
  }catch(e){console.error('ORDER ERR',e)}

})();

/* =====================================================================
   APEX VR LAB · stations.js — THE FILE YOU EDIT TO ADD LABS
   ---------------------------------------------------------------------
   Every entry in "stations" is one station in the room.
     lab   : chapter number of a lab file in labs/ (e.g. labs/ch01.js has lab 1)
     pos   : [x, z] position on the floor in metres (room centre = 0,0;
             the back wall is at z = -room.d/2)
     rotY  : rotation in radians (0 = the board faces the room entrance)
     bind  : optional – parts you operate with your hands ON the components,
             per simulation id. Everything else is on the control desk,
             which is generated automatically for every lab.
   Hand-operated part types:
     lever   – a directional valve's hand lever      {comp, key, values}
     knob    – twist an adjusting knob               {comp, key, local, axis, min, max, step, perTurn, label, unit}
     buttons – start/stop box next to a component    {comp, key, at, items:[[value, label, colour]], title}
     toggle  – one push button that switches on/off  {comp, key, at, label, on, off, col}
   ===================================================================== */
window.VR_CONFIG={
  title:'מעבדה במערכות הידראוליות ופנאומטיות',
  logo:'assets/logo.png',
  room:{w:14,d:12},
  start:{pos:[0,0.2],yaw:0},
  labFiles:['labs/ch01.js'],
  stations:[
    {id:'ch01',lab:1,pos:[0,-3.4],rotY:0,
     bind:{
       first:[
         {type:'lever',comp:'V1',key:'pos',values:['a','0','b']},
         {type:'buttons',comp:'P1',key:'on',at:[-92,34],title:'מנוע המשאבה',items:[[true,'הפעלה',0x22c55e],[false,'עצירה',0xef4444]]},
         {type:'knob',comp:'RV',key:'pr',local:[31.5,0,11],axis:'x',min:20,max:350,step:5,perTurn:120,label:'כיול שסתום הפריקה',unit:'bar'}],
       loto:[
         {type:'lever',comp:'V1',key:'pos',values:['a','0','b']},
         {type:'buttons',comp:'P1',key:'on',at:[100,46],title:'מנוע המשאבה',items:[[true,'הפעלה',0x22c55e],[false,'עצירה',0xef4444]]},
         {type:'toggle',comp:'ISO',key:'lock',at:[-58,22],label:'מנעול',col:0xfacc15,icon:'🔒',on:'שמת מנעול ותווית על המפסק הראשי – אי אפשר להפעיל את המנוע',off:'הסרת את המנעול והתווית מהמפסק הראשי'},
         {type:'toggle',comp:'SVB',key:'bleed',at:[0,34],label:'ברז פריקה',col:0x22c55e,icon:'🚰',on:'פתחת את ברז פריקת מצבר הלחץ – השמן בלחץ זורם למיכל',off:'סגרת את ברז פריקת מצבר הלחץ'},
         {type:'toggle',comp:'FT',key:'open',at:[-52,44],label:'מחבר',col:0xef4444,icon:'🔧',on:'פתחת את מחבר הצינור של הצילינדר',off:'סגרת את מחבר הצינור'},
         {type:'knob',comp:'RV',key:'pr',local:[31.5,0,11],axis:'x',min:40,max:300,step:5,perTurn:120,label:'כיול שסתום הפריקה',unit:'bar'}]
     }},
    /* the next labs go here, for example:
    {id:'ch02',lab:2,pos:[4.2,-3.4],rotY:-0.35},
    {id:'ch07',lab:7,pos:[-4.2,-3.4],rotY:0.35},
    and add 'labs/ch02.js', 'labs/ch07.js' to labFiles above */
  ]
};

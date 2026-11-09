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
  room:{w:26,d:40},
  start:{pos:[0,15.6],yaw:0},
  labFiles:['labs/ch01.js', 'labs/ch02.js', 'labs/ch03.js', 'labs/ch04.js', 'labs/ch05.js', 'labs/ch06.js', 'labs/ch07.js', 'labs/ch08.js', 'labs/ch09.js', 'labs/ch10.js', 'labs/ch11.js', 'labs/ch12.js', 'labs/ch13.js', 'labs/ch14.js', 'labs/ch15.js', 'labs/ch16.js', 'labs/ch17.js', 'labs/ch18.js', 'labs/ch19.js', 'labs/ch20.js', 'labs/ch21.js', 'labs/ch22.js', 'labs/ch23.js', 'labs/ch24.js', 'labs/ch25.js', 'labs/ch26.js'],
  /* the lab directory in the lobby (VR "main page") */
  parts:[
    {t:'חלק א׳ – יסודות ורכיבים',color:'#3b82f6',labs:[1, 2, 3, 4, 5, 6, 7, 8]},
    {t:'חלק ב׳ – מעגלים הידראוליים',color:'#22c55e',labs:[9, 10, 11, 12, 13, 14, 15, 16, 17]},
    {t:'חלק ג׳ – מערכות, בקרה ותכנון',color:'#a855f7',labs:[18, 19, 20, 21, 22, 23]},
    {t:'חלק ד׳ – פנאומטיקה, מדידות ותקלות',color:'#f97316',labs:[24, 25, 26]},
  ],
  /* stations: rows of 6, from the lobby inward. A station is built only when you come close. */
  stations:[
    {id:'ch01',lab:1,pos:[10.5,10],rotY:0,color:'#3b82f6',
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
    {id:'ch02',lab:2,pos:[6.3,10],rotY:0,color:'#3b82f6'},
    {id:'ch03',lab:3,pos:[2.1,10],rotY:0,color:'#3b82f6'},
    {id:'ch04',lab:4,pos:[-2.1,10],rotY:0,color:'#3b82f6'},
    {id:'ch05',lab:5,pos:[-6.3,10],rotY:0,color:'#3b82f6'},
    {id:'ch06',lab:6,pos:[-10.5,10],rotY:0,color:'#3b82f6'},
    {id:'ch07',lab:7,pos:[10.5,3.5],rotY:0,color:'#3b82f6'},
    {id:'ch08',lab:8,pos:[6.3,3.5],rotY:0,color:'#3b82f6'},
    {id:'ch09',lab:9,pos:[2.1,3.5],rotY:0,color:'#22c55e'},
    {id:'ch10',lab:10,pos:[-2.1,3.5],rotY:0,color:'#22c55e'},
    {id:'ch11',lab:11,pos:[-6.3,3.5],rotY:0,color:'#22c55e'},
    {id:'ch12',lab:12,pos:[-10.5,3.5],rotY:0,color:'#22c55e'},
    {id:'ch13',lab:13,pos:[10.5,-3],rotY:0,color:'#22c55e'},
    {id:'ch14',lab:14,pos:[6.3,-3],rotY:0,color:'#22c55e'},
    {id:'ch15',lab:15,pos:[2.1,-3],rotY:0,color:'#22c55e'},
    {id:'ch16',lab:16,pos:[-2.1,-3],rotY:0,color:'#22c55e'},
    {id:'ch17',lab:17,pos:[-6.3,-3],rotY:0,color:'#22c55e'},
    {id:'ch18',lab:18,pos:[-10.5,-3],rotY:0,color:'#a855f7'},
    {id:'ch19',lab:19,pos:[10.5,-9.5],rotY:0,color:'#a855f7'},
    {id:'ch20',lab:20,pos:[6.3,-9.5],rotY:0,color:'#a855f7'},
    {id:'ch21',lab:21,pos:[2.1,-9.5],rotY:0,color:'#a855f7'},
    {id:'ch22',lab:22,pos:[-2.1,-9.5],rotY:0,color:'#a855f7'},
    {id:'ch23',lab:23,pos:[-6.3,-9.5],rotY:0,color:'#a855f7'},
    {id:'ch24',lab:24,pos:[-10.5,-9.5],rotY:0,color:'#f97316'},
    {id:'ch25',lab:25,pos:[10.5,-16],rotY:0,color:'#f97316'},
    {id:'ch26',lab:26,pos:[6.3,-16],rotY:0,color:'#f97316'}
  ]
};

import { ToastrService } from 'ngx-toastr';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { map } from 'rxjs/operators'
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AnnonceService {

  userId : string = JSON.parse (localStorage.getItem('user')).uid;  
  constructor(
    private storage: AngularFireStorage,
    private afs : AngularFirestore,
    private toastr : ToastrService,
    private router : Router
  ) { }

  uploadImage(selectedImage: any, annonceData: any, formStatus: any, id:any){
    const filePath = `annonceImg/${Date.now()}`;
    console.log(filePath);

    this.storage.upload(filePath, selectedImage).then(()=>{
      console.log('annonce image uploaded seccesfully');
      
      this.storage.ref(filePath).getDownloadURL().subscribe(URL =>{
        annonceData.annonceImgPath = URL;
        console.log(annonceData);

        if (formStatus == 'Modifier votre annonce') {
          this.updateData(id, annonceData)
        } else {
          this.saveData(annonceData);
        }
      })
    })   
  }

  saveData(annonceData:any){
    this.afs.collection('annonces').add(annonceData).then(docRef =>{
      this.toastr.success('Data insert successfully');
      this.router.navigate(['/liste'])
    })  
  }

  loadData(){

    return this.afs.collection('annonces', ref => ref.orderBy('createdAt', "desc")).snapshotChanges().pipe(
      map(actions =>{
     return actions.map(a =>{
       const data = a.payload.doc.data();
       const id = a.payload.doc.id;
       return {id, data}
     })
   }))
 }

  loadList(){
    return this.afs.collection('annonces', ref => ref.where('userId', '==', this.userId)).snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, data }
        })
      }))
 }



 loadOneData(id : any){
  return this.afs.doc(`annonces/${id}`).valueChanges();
}

 updateData(id: any, annonceData: any){

  this.afs.doc(`annonces/${id}`).update(annonceData).then(()=>{
    this.toastr.success('Data updated successfully');
    this.router.navigate(['/liste'])
  })
}

 deleteImage(annonceImgPath: any, id: any){
  this.storage.storage.refFromURL(annonceImgPath).delete().then(() =>{
    this.deleteData(id);
  })
 }

 deleteData(id: any){
  this.afs.doc(`annonces/${id}`).delete().then(()=>{
    this.toastr.warning('Data deleted ...!');

  })
 }

 markactive(id: any, activeData: any){

  this.afs.doc(`annonces/${id}`).update(activeData).then(()=>{
    this.toastr.info('active Status updated')
  })
 }

  loadDesactive() {

    return this.afs.collection('annonces', ref => ref.where('isActive', '==', false)).snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, data }
        })
      }))
  }

  loadPerdu() {

    return this.afs.collection('annonces', ref => ref.where('category.category', '==', 'Perdu').where('isActive', '==', true)).snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, data }
        })
      }))
  }

  loadTrouve() {

    return this.afs.collection('annonces', ref => ref.where('category.category', '==', 'Trouvé').where('isActive', '==', true)).snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, data }
        })
      }))
  }

  loadCategoryAnnonce(categoryId: any){
    return this.afs.collection('annonces', ref => ref.where('category.categoryId', '==', categoryId)).snapshotChanges().pipe(
      map(actions =>{
     return actions.map(a =>{
       const data = a.payload.doc.data();
       const id = a.payload.doc.id;
       return {id, data}
     })
   }))
   }
}

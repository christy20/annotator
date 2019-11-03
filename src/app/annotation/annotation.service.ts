import { Injectable } from '@angular/core';
import { Entity } from '../shared/entity.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { AnnotatedDocument } from '../shared/annotated-document.model';
import { BratUtils } from './brat/brat-utils';

@Injectable()
export class AnnotationService {

  constructor(private readonly afs: AngularFirestore) {
  }

  // Retourne de façon asynschore le document de type project, dont le id est passé en paramètre, à partir de la base de données Firestore
  getProject(projectId): Promise<any> {
    return this.afs.collection('Projects/').doc(projectId).ref.get();
  }
  getUserID(uid): Promise<any> {
    return this.afs.collection('Users/').doc(uid).ref.get();
  }

  saveAnnotatedDocument(annotatedDocument: AnnotatedDocument): void {
    if (annotatedDocument.documentId === null) {
      annotatedDocument.documentId = this.afs.createId();
      //assigner le userID au document lorsque l'annotateur y accède pour la 1re fois
      // annotatedDocument.userId = firebase.auth().currentUser.uid;

    }

    this.afs
      .collection('AnnotatedDocument')
      .doc(annotatedDocument.documentId)
      .set(Object.assign({}, annotatedDocument));
  }

  getAnnotatedDocument(documentId: string): Promise<any> {
    return this.afs.collection('AnnotatedDocument/').doc(documentId).ref.get();
  }

  //fonction qui devrait aller chercher le document associé a l'annotateur
  getAnnotatorDocument(documentId: string): Promise<any> {
    return this.afs.collection('AnnotatatedDocument/').doc(documentId).ref.get();
  }

}

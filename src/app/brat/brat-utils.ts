import {
  AnnotatedDocument,
  EntityAnnotationUtils,
  AttributeAnnotationUtils,
  RelationAnnotationUtils,
  EventAnnotationUtils,
  EventLinkUtils,
  EntityAnnotation,
  AttributeAnnotation,
  RelationAnnotation,
  EventAnnotation,
  EventLink
} from "../models";
import {
  DocumentData,
  rawRelation,
  rawEventLink,
  rawAttribute,
  rawEntity
} from "./document-data";
import { EntityAttributeValues } from "../models/entityAttribute.model";
import { Project } from "../models/project.model";
import { CollectionData } from "./collection-data";

export class BratUtils {
  static getDocDataFromAnnotatedDocument(
    annotatedDocument: AnnotatedDocument
  ): DocumentData {
    const docData: DocumentData = {
      text: annotatedDocument.text,
      entities: annotatedDocument.entities.map(entity => {
        const e: rawEntity = [
          entity.id,
          entity.type,
          entity.locations.map(x => [x.start, x.end] as [number, number])
        ];
        return e;
      }),
      attributes: annotatedDocument.attributes.map(attribute => {
        const a: rawAttribute = [
          attribute.id,
          attribute.type,
          attribute.target
        ];
        return a;
      }),
      relations: annotatedDocument.relations.map(relation => {
        const r: rawRelation = [
          relation.id,
          relation.type,
          [
            [relation.from.role, relation.from.id],
            [relation.to.role, relation.to.id]
          ]
        ];
        return r;
      }),
      triggers: [],
      events: [],
      comments: [],
      ctime: 1351154734.5055847,
      messages: [],
      modifications: [],
      normalizations: [],
      source_files: []
    };

    annotatedDocument.events.forEach(event => {
      docData.triggers.push([
        event.triggerId,
        event.type,
        event.locations.map(x => [x.start, x.end] as [number, number])
      ]);
      docData.events.push([
        event.id,
        event.triggerId,
        event.links.map(link => {
          const l: rawEventLink = [link.type, link.id];
          return l;
        })
      ]);
    });

    console.log(docData);

    return docData;
  }

  static getColDataFromProject(project: Project): CollectionData {
    const collectionData: CollectionData = {
      items: [],
      messages: [],
      search_config: [
        ["Google", "http://www.google.com/search?q=%s"],
        ["Wikipedia", "http://en.wikipedia.org/wiki/Special:Search?search=%s"],
        ["UniProt", "http://www.uniprot.org/uniprot/?sort=score&query=%s"],
        ["EntrezGene", "http://www.ncbi.nlm.nih.gov/gene?term=%s"],
        [
          "GeneOntology",
          "http://amigo.geneontology.org/cgi-bin/amigo/search.cgi?search_query=%s&action=new-search&search_constraint=term"
        ],
        ["ALC", "http://eow.alc.co.jp/%s"]
      ],
      disambiguator_config: [],
      unconfigured_types: [
        {
          borderColor: "darken",
          arrowHead: "triangle,5",
          name: "Cause",
          color: "#007700",
          labels: ["Cause"],
          unused: true,
          bgColor: "lightgreen",
          type: "Cause",
          fgColor: "black"
        }
      ],
      ui_names: {
        entities: "entités",
        events: "événements",
        relations: "relations",
        attributes: "attributs"
      },
      entity_types: project.entities.map(x => ({
        name: x.type,
        type: x.type,
        labels: x.labels,
        bgColor: x.bgColor,
        borderColor: x.borderColor,
        unused: false,
        // TODO: Fill
        attributes: x.attributes,
        // TODO: Fill
        arcs: x.arcs,
        // TODO: Fill
        children: []
      })),
      event_types: project.events.map(x => ({
        name: x.type,
        type: x.type,
        labels: x.labels,
        bgColor: x.bgColor,
        borderColor: x.borderColor,
        unused: false,
        attributes: [],
        children: [],
        arcs: x.arcs
      })),
      relation_types: project.relations.map(x => ({
        type: x.type,
        labels: x.labels,
        dashArray: x.dashArray,
        color: x.color,
        args: x.args
        // attribute: []
      })),
      entity_attribute_types: project.attributes.map(x => ({
        bool: x.bool,
        name: x.type,
        type: x.type,
        values: BratUtils.formatValues(x.values, x.type)
      })),
      // TODO: Have something in project to represent this attribute
      event_attribute_types: [],
      // TODO: Have something in project to represent this attribute
      relation_attribute_types: []
    };

    console.log(collectionData);

    return collectionData;
  }

  //Méthode qui reçoit le tableau de valeur et les transforme en Json pour Brat
  static formatValues(values: EntityAttributeValues[], name: string) {
    let result = {};

    values.forEach(value => {
      result[name] = {
        box: value.box,
        glyph: value.glyph,
        dashArray: value.dashArray
      };
    });

    return result;
  }

  static getAnnotatedDocumentfromDocData(
    docData: DocumentData,
    project: Project,
    annotatedDocument: AnnotatedDocument
  ): AnnotatedDocument {
    // Entities :
    annotatedDocument.entities = docData.entities.map(docEntity => {
      const entity: EntityAnnotation = EntityAnnotationUtils.generateEmpty();
      const project_entity = project.entities.find(
        e => e.type === docEntity[1]
      );

      // Document entity
      entity.id = docEntity[0];
      entity.locations = docEntity[2].map(x => ({
        start: x[0],
        end: x[1]
      }));

      // Project entity
      entity.name = project_entity.name;
      entity.type = project_entity.type;
      entity.bgColor = project_entity.bgColor;
      entity.labels = project_entity.labels;
      entity.borderColor = project_entity.borderColor;

      return entity;
    });

    // Attributes :
    annotatedDocument.attributes = docData.attributes.map(docAttribute => {
      const attribute: AttributeAnnotation = AttributeAnnotationUtils.generateEmpty();
      const project_attribute = project.attributes.find(
        a => a.type === docAttribute[1]
      );

      // Document attribute
      attribute.id = docAttribute[0];
      attribute.type = docAttribute[1];
      attribute.target = docAttribute[2];

      // Project attribute
      attribute.name = project_attribute.name;
      attribute.values = project_attribute.values;
      attribute.bool = project_attribute.bool;

      return attribute;
    });

    // Relations :
    annotatedDocument.relations = docData.relations.map(docRelation => {
      const relation: RelationAnnotation = RelationAnnotationUtils.generateEmpty();
      const project_relation = project.relations.find(
        r => r.type === docRelation[1]
      );

      // Document relation
      relation.id = docRelation[0];
      relation.type = docRelation[1];
      relation.from.role = docRelation[2][0][0];
      relation.from.id = docRelation[2][0][1];
      relation.to.role = docRelation[2][1][0];
      relation.to.id = docRelation[2][1][1];

      // Project relation
      relation.color = project_relation.color;
      relation.labels = project_relation.labels;
      relation.type = project_relation.type;
      relation.args = project_relation.args;
      relation.dashArray = project_relation.dashArray;

      return relation;
    });

    // Events :
    annotatedDocument.events = [];
    for (let i = 0; i < docData.events.length; i++) {
      const docTrigger = docData.triggers[i];
      const docEvent = docData.events[i];
      const projectEvent = project.events.find(e => e.type === docTrigger[1]);

      const event: EventAnnotation = EventAnnotationUtils.generateEmpty();
      // Project event
      event.labels = projectEvent.labels;
      event.type = docTrigger[1];
      event.bgColor = projectEvent.bgColor;
      event.attributes = projectEvent.attributes;
      event.name = projectEvent.name;
      event.arcs = projectEvent.arcs;
      event.locations = docTrigger[2].map(x => ({
        start: x[0],
        end: x[1]
      }));

      // Document event
      event.triggerId = docTrigger[0];

      event.id = docEvent[0];

      // TODO : vérifier que docEvent[1] se trouve dans les triggers

      event.links = docEvent[2].map(docLink => {
        const link: EventLink = EventLinkUtils.generateEmpty();
        link.id = docLink[1];
        link.type = docLink[0];
        return link;
      });

      annotatedDocument.events.push(event);
    }

    console.log(annotatedDocument);

    return annotatedDocument;
  }
}

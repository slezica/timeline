import PouchDB from 'pouchdb'

export const db = new PouchDB('test')
window.db = db

let emit // shut up, linter

const migrations = [
  ["Create indices design doc", async () => {

    function mapKind(doc) {
      if (doc.type != 'item') { return }
      emit(doc.kind, doc._id)
    }

    function mapLatestDate(doc) {
      if (doc.type != 'item') { return }

      for (let key in doc) {
        if (key.endsWith('Date') && doc[key] != null) {
          emit(doc[key], { id: doc._id, kind: doc.kind, dateKind: key, date: doc[key] })
        }
      }

    }

    const index = {
      _id: '_design/index',
      views: {
        byKind: {
          map: mapKind.toString()
        },

        byLatestDate: {
          map: mapLatestDate.toString()
        }
      }
    }

    await db.put(index)
  }]
]


export async function initializeDb() {
  console.log('[db]', "Initializing")

  let status
  try {
    status = await db.get('status')

  } catch (err) {
    if (err.status != 404) throw err

    status = {
      _id: 'status',
      migration: -1
    }

    const statusCreated = await db.put(status)
    status._rev = statusCreated.rev
  }

  for (let i = status.migration + 1; i < migrations.length; i++) {
    const [ name, f ] = migrations[i]

    console.log('[db]', "Applying migration", name)
    await f()

    status.migration += 1

    const statusUpdated = await db.put(status)
    status._rev = statusUpdated.rev
  }

  console.log('[db]', "Initialized")
}


window.putSampleData = async function() {
  const samples = [
    {"_id":"testdoc1","type":"item","kind":"task","title":"Write project proposal","createdDate":"2025-09-01T09:00:00.000Z","updatedDate":"2025-09-01T12:00:00.000Z","dueDate":"2025-09-05T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc2","type":"item","kind":"task","title":"Prepare presentation slides","createdDate":"2025-09-02T09:00:00.000Z","updatedDate":"2025-09-02T12:00:00.000Z","dueDate":"2025-09-06T09:00:00.000Z","doneDate":"2025-09-06T15:30:00.000Z"} ,
    {"_id":"testdoc3","type":"item","kind":"task","title":"Team meeting notes","createdDate":"2025-09-03T09:00:00.000Z","updatedDate":"2025-09-03T12:00:00.000Z","dueDate":null,"doneDate":null} ,
    {"_id":"testdoc4","type":"item","kind":"task","title":"Refactor authentication module","createdDate":"2025-09-04T09:00:00.000Z","updatedDate":"2025-09-04T12:00:00.000Z","dueDate":"2025-09-08T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc5","type":"item","kind":"task","title":"Write end-to-end tests","createdDate":"2025-09-05T09:00:00.000Z","updatedDate":"2025-09-05T12:00:00.000Z","dueDate":"2025-09-09T09:00:00.000Z","doneDate":"2025-09-10T15:30:00.000Z"} ,
    {"_id":"testdoc6","type":"item","kind":"task","title":"Update documentation","createdDate":"2025-09-06T09:00:00.000Z","updatedDate":"2025-09-06T12:00:00.000Z","dueDate":null,"doneDate":null} ,
    {"_id":"testdoc7","type":"item","kind":"task","title":"Code review sprint","createdDate":"2025-09-07T09:00:00.000Z","updatedDate":"2025-09-07T12:00:00.000Z","dueDate":"2025-09-11T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc8","type":"item","kind":"task","title":"Design new feature mockups","createdDate":"2025-09-08T09:00:00.000Z","updatedDate":"2025-09-08T12:00:00.000Z","dueDate":"2025-09-12T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc9","type":"item","kind":"task","title":"Fix login bug","createdDate":"2025-09-09T09:00:00.000Z","updatedDate":"2025-09-09T12:00:00.000Z","dueDate":null,"doneDate":"2025-09-14T15:30:00.000Z"} ,
    {"_id":"testdoc10","type":"item","kind":"task","title":"Optimize database queries","createdDate":"2025-09-10T09:00:00.000Z","updatedDate":"2025-09-10T12:00:00.000Z","dueDate":"2025-09-14T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc11","type":"item","kind":"task","title":"Conduct user interviews","createdDate":"2025-09-11T09:00:00.000Z","updatedDate":"2025-09-11T12:00:00.000Z","dueDate":"2025-09-15T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc12","type":"item","kind":"task","title":"Integrate payment gateway","createdDate":"2025-09-12T09:00:00.000Z","updatedDate":"2025-09-12T12:00:00.000Z","dueDate":null,"doneDate":"2025-09-17T15:30:00.000Z"} ,
    {"_id":"testdoc13","type":"item","kind":"task","title":"Plan sprint retrospective","createdDate":"2025-09-13T09:00:00.000Z","updatedDate":"2025-09-13T12:00:00.000Z","dueDate":"2025-09-17T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc14","type":"item","kind":"task","title":"Test API endpoints","createdDate":"2025-09-14T09:00:00.000Z","updatedDate":"2025-09-14T12:00:00.000Z","dueDate":"2025-09-18T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc15","type":"item","kind":"task","title":"Draft onboarding guide","createdDate":"2025-09-15T09:00:00.000Z","updatedDate":"2025-09-15T12:00:00.000Z","dueDate":null,"doneDate":"2025-09-20T15:30:00.000Z"} ,
    {"_id":"testdoc16","type":"item","kind":"task","title":"Security audit","createdDate":"2025-09-16T09:00:00.000Z","updatedDate":"2025-09-16T12:00:00.000Z","dueDate":"2025-09-20T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc17","type":"item","kind":"task","title":"Implement caching layer","createdDate":"2025-09-17T09:00:00.000Z","updatedDate":"2025-09-17T12:00:00.000Z","dueDate":"2025-09-21T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc18","type":"item","kind":"task","title":"Review analytics reports","createdDate":"2025-09-18T09:00:00.000Z","updatedDate":"2025-09-18T12:00:00.000Z","dueDate":null,"doneDate":null} ,
    {"_id":"testdoc19","type":"item","kind":"task","title":"Fix CSS layout issues","createdDate":"2025-09-19T09:00:00.000Z","updatedDate":"2025-09-19T12:00:00.000Z","dueDate":"2025-09-23T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc20","type":"item","kind":"task","title":"Set up monitoring alerts","createdDate":"2025-09-20T09:00:00.000Z","updatedDate":"2025-09-20T12:00:00.000Z","dueDate":"2025-09-24T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc21","type":"item","kind":"task","title":"Automate deployment","createdDate":"2025-09-21T09:00:00.000Z","updatedDate":"2025-09-21T12:00:00.000Z","dueDate":null,"doneDate":"2025-09-26T15:30:00.000Z"} ,
    {"_id":"testdoc22","type":"item","kind":"task","title":"Benchmark new service","createdDate":"2025-09-22T09:00:00.000Z","updatedDate":"2025-09-22T12:00:00.000Z","dueDate":"2025-09-26T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc23","type":"item","kind":"task","title":"Organize team workshop","createdDate":"2025-09-23T09:00:00.000Z","updatedDate":"2025-09-23T12:00:00.000Z","dueDate":"2025-09-27T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc24","type":"item","kind":"task","title":"Update dependencies","createdDate":"2025-09-24T09:00:00.000Z","updatedDate":"2025-09-24T12:00:00.000Z","dueDate":null,"doneDate":null} ,
    {"_id":"testdoc25","type":"item","kind":"task","title":"Cleanup codebase","createdDate":"2025-09-25T09:00:00.000Z","updatedDate":"2025-09-25T12:00:00.000Z","dueDate":"2025-09-29T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc26","type":"item","kind":"task","title":"Prepare quarterly report","createdDate":"2025-09-26T09:00:00.000Z","updatedDate":"2025-09-26T12:00:00.000Z","dueDate":"2025-09-30T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc27","type":"item","kind":"task","title":"Write unit tests","createdDate":"2025-09-27T09:00:00.000Z","updatedDate":"2025-09-27T12:00:00.000Z","dueDate":null,"doneDate":"2025-10-02T15:30:00.000Z"} ,
    {"_id":"testdoc28","type":"item","kind":"task","title":"Refine UX design","createdDate":"2025-09-28T09:00:00.000Z","updatedDate":"2025-09-28T12:00:00.000Z","dueDate":"2025-10-02T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc29","type":"item","kind":"task","title":"Audit error logs","createdDate":"2025-09-29T09:00:00.000Z","updatedDate":"2025-09-29T12:00:00.000Z","dueDate":"2025-10-03T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc30","type":"item","kind":"task","title":"Implement search feature","createdDate":"2025-09-30T09:00:00.000Z","updatedDate":"2025-09-30T12:00:00.000Z","dueDate":null,"doneDate":null} ,
    {"_id":"testdoc31","type":"item","kind":"task","title":"Conduct load testing","createdDate":"2025-10-01T09:00:00.000Z","updatedDate":"2025-10-01T12:00:00.000Z","dueDate":null,"doneDate":"2025-10-05T15:30:00.000Z"} ,
    {"_id":"testdoc32","type":"item","kind":"task","title":"Draft release notes","createdDate":"2025-10-02T09:00:00.000Z","updatedDate":"2025-10-02T12:00:00.000Z","dueDate":"2025-10-08T09:00:00.000Z","doneDate":"2025-10-09T15:30:00.000Z"} ,
    {"_id":"testdoc33","type":"item","kind":"task","title":"Fix broken builds","createdDate":"2025-10-03T09:00:00.000Z","updatedDate":"2025-10-03T12:00:00.000Z","dueDate":"2025-10-07T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc34","type":"item","kind":"task","title":"Plan marketing campaign","createdDate":"2025-10-04T09:00:00.000Z","updatedDate":"2025-10-04T12:00:00.000Z","dueDate":"2025-10-10T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc35","type":"item","kind":"task","title":"Review pull requests","createdDate":"2025-10-05T09:00:00.000Z","updatedDate":"2025-10-05T12:00:00.000Z","dueDate":"2025-10-11T09:00:00.000Z","doneDate":"2025-10-12T15:30:00.000Z"} ,
    {"_id":"testdoc36","type":"item","kind":"task","title":"Optimize image assets","createdDate":"2025-10-06T09:00:00.000Z","updatedDate":"2025-10-06T12:00:00.000Z","dueDate":null,"doneDate":"2025-10-10T15:30:00.000Z"} ,
    {"_id":"testdoc37","type":"item","kind":"task","title":"Run security scans","createdDate":"2025-10-07T09:00:00.000Z","updatedDate":"2025-10-07T12:00:00.000Z","dueDate":"2025-10-11T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc38","type":"item","kind":"task","title":"Update style guide","createdDate":"2025-10-08T09:00:00.000Z","updatedDate":"2025-10-08T12:00:00.000Z","dueDate":"2025-10-14T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc39","type":"item","kind":"task","title":"Host stakeholder meeting","createdDate":"2025-10-09T09:00:00.000Z","updatedDate":"2025-10-09T12:00:00.000Z","dueDate":null,"doneDate":"2025-10-13T15:30:00.000Z"} ,
    {"_id":"testdoc40","type":"item","kind":"task","title":"Write migration scripts","createdDate":"2025-10-10T09:00:00.000Z","updatedDate":"2025-10-10T12:00:00.000Z","dueDate":"2025-10-16T09:00:00.000Z","doneDate":"2025-10-17T15:30:00.000Z"} ,
    {"_id":"testdoc41","type":"item","kind":"task","title":"Setup staging server","createdDate":"2025-10-11T09:00:00.000Z","updatedDate":"2025-10-11T12:00:00.000Z","dueDate":null,"doneDate":"2025-10-15T15:30:00.000Z"} ,
    {"_id":"testdoc42","type":"item","kind":"task","title":"Validate data models","createdDate":"2025-10-12T09:00:00.000Z","updatedDate":"2025-10-12T12:00:00.000Z","dueDate":"2025-10-16T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc43","type":"item","kind":"task","title":"Improve error handling","createdDate":"2025-10-13T09:00:00.000Z","updatedDate":"2025-10-13T12:00:00.000Z","dueDate":"2025-10-19T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc44","type":"item","kind":"task","title":"Conduct competitor analysis","createdDate":"2025-10-14T09:00:00.000Z","updatedDate":"2025-10-14T12:00:00.000Z","dueDate":"2025-10-18T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc45","type":"item","kind":"task","title":"Polish UI components","createdDate":"2025-10-15T09:00:00.000Z","updatedDate":"2025-10-15T12:00:00.000Z","dueDate":"2025-10-21T09:00:00.000Z","doneDate":"2025-10-22T15:30:00.000Z"} ,
    {"_id":"testdoc46","type":"item","kind":"task","title":"Review legal compliance","createdDate":"2025-10-16T09:00:00.000Z","updatedDate":"2025-10-16T12:00:00.000Z","dueDate":"2025-10-22T09:00:00.000Z","doneDate":"2025-10-23T15:30:00.000Z"} ,
    {"_id":"testdoc47","type":"item","kind":"task","title":"Fix memory leaks","createdDate":"2025-10-17T09:00:00.000Z","updatedDate":"2025-10-17T12:00:00.000Z","dueDate":null,"doneDate":"2025-10-21T15:30:00.000Z"} ,
    {"_id":"testdoc48","type":"item","kind":"task","title":"Train new hires","createdDate":"2025-10-18T09:00:00.000Z","updatedDate":"2025-10-18T12:00:00.000Z","dueDate":"2025-10-24T09:00:00.000Z","doneDate":"2025-10-25T15:30:00.000Z"} ,
    {"_id":"testdoc49","type":"item","kind":"task","title":"Design landing page","createdDate":"2025-10-19T09:00:00.000Z","updatedDate":"2025-10-19T12:00:00.000Z","dueDate":"2025-10-25T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc50","type":"item","kind":"task","title":"Collect customer feedback","createdDate":"2025-10-20T09:00:00.000Z","updatedDate":"2025-10-20T12:00:00.000Z","dueDate":"2025-10-26T09:00:00.000Z","doneDate":"2025-10-27T15:30:00.000Z"} ,
    {"_id":"testdoc51","type":"item","kind":"task","title":"Refactor notification service","createdDate":"2025-10-21T09:00:00.000Z","updatedDate":"2025-10-21T12:00:00.000Z","dueDate":null,"doneDate":"2025-10-25T15:30:00.000Z"} ,
    {"_id":"testdoc52","type":"item","kind":"task","title":"A/B test homepage","createdDate":"2025-10-22T09:00:00.000Z","updatedDate":"2025-10-22T12:00:00.000Z","dueDate":"2025-10-28T09:00:00.000Z","doneDate":"2025-10-29T15:30:00.000Z"} ,
    {"_id":"testdoc53","type":"item","kind":"task","title":"Migrate logs to ELK","createdDate":"2025-10-23T09:00:00.000Z","updatedDate":"2025-10-23T12:00:00.000Z","dueDate":"2025-10-27T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc54","type":"item","kind":"task","title":"Write data retention policy","createdDate":"2025-10-24T09:00:00.000Z","updatedDate":"2025-10-24T12:00:00.000Z","dueDate":"2025-10-30T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc55","type":"item","kind":"task","title":"Localize onboarding flow","createdDate":"2025-10-25T09:00:00.000Z","updatedDate":"2025-10-25T12:00:00.000Z","dueDate":"2025-10-31T09:00:00.000Z","doneDate":"2025-11-01T15:30:00.000Z"} ,
    {"_id":"testdoc56","type":"item","kind":"task","title":"Backfill analytics events","createdDate":"2025-10-26T09:00:00.000Z","updatedDate":"2025-10-26T12:00:00.000Z","dueDate":null,"doneDate":"2025-10-30T15:30:00.000Z"} ,
    {"_id":"testdoc57","type":"item","kind":"task","title":"Reduce bundle size","createdDate":"2025-10-27T09:00:00.000Z","updatedDate":"2025-10-27T12:00:00.000Z","dueDate":"2025-10-31T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc58","type":"item","kind":"task","title":"Enable HTTP/3","createdDate":"2025-10-28T09:00:00.000Z","updatedDate":"2025-10-28T12:00:00.000Z","dueDate":"2025-11-03T09:00:00.000Z","doneDate":"2025-11-04T15:30:00.000Z"} ,
    {"_id":"testdoc59","type":"item","kind":"task","title":"Purge deprecated endpoints","createdDate":"2025-10-29T09:00:00.000Z","updatedDate":"2025-10-29T12:00:00.000Z","dueDate":null,"doneDate":"2025-11-02T15:30:00.000Z"} ,
    {"_id":"testdoc60","type":"item","kind":"task","title":"Tune Postgres autovacuum","createdDate":"2025-10-30T09:00:00.000Z","updatedDate":"2025-10-30T12:00:00.000Z","dueDate":"2025-11-05T09:00:00.000Z","doneDate":"2025-11-06T15:30:00.000Z"} ,
    {"_id":"testdoc61","type":"item","kind":"task","title":"Harden CSP headers","createdDate":"2025-10-31T09:00:00.000Z","updatedDate":"2025-10-31T12:00:00.000Z","dueDate":null,"doneDate":"2025-11-04T15:30:00.000Z"} ,
    {"_id":"testdoc62","type":"item","kind":"task","title":"Archive stale branches","createdDate":"2025-11-01T09:00:00.000Z","updatedDate":"2025-11-01T12:00:00.000Z","dueDate":"2025-11-07T09:00:00.000Z","doneDate":"2025-11-08T15:30:00.000Z"} ,
    {"_id":"testdoc63","type":"item","kind":"task","title":"Document runbooks","createdDate":"2025-11-02T09:00:00.000Z","updatedDate":"2025-11-02T12:00:00.000Z","dueDate":"2025-11-06T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc64","type":"item","kind":"task","title":"Rotate API keys","createdDate":"2025-11-03T09:00:00.000Z","updatedDate":"2025-11-03T12:00:00.000Z","dueDate":"2025-11-09T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc65","type":"item","kind":"task","title":"Add 2FA enforcement","createdDate":"2025-11-04T09:00:00.000Z","updatedDate":"2025-11-04T12:00:00.000Z","dueDate":"2025-11-10T09:00:00.000Z","doneDate":"2025-11-11T15:30:00.000Z"} ,
    {"_id":"testdoc66","type":"item","kind":"task","title":"Upgrade Kubernetes cluster","createdDate":"2025-11-05T09:00:00.000Z","updatedDate":"2025-11-05T12:00:00.000Z","dueDate":null,"doneDate":"2025-11-09T15:30:00.000Z"} ,
    {"_id":"testdoc67","type":"item","kind":"task","title":"Consolidate feature flags","createdDate":"2025-11-06T09:00:00.000Z","updatedDate":"2025-11-06T12:00:00.000Z","dueDate":"2025-11-10T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc68","type":"item","kind":"task","title":"Chaos testing drill","createdDate":"2025-11-07T09:00:00.000Z","updatedDate":"2025-11-07T12:00:00.000Z","dueDate":"2025-11-13T09:00:00.000Z","doneDate":"2025-11-14T15:30:00.000Z"} ,
    {"_id":"testdoc69","type":"item","kind":"task","title":"Migrate CI to GitHub Actions","createdDate":"2025-11-08T09:00:00.000Z","updatedDate":"2025-11-08T12:00:00.000Z","dueDate":null,"doneDate":"2025-11-12T15:30:00.000Z"} ,
    {"_id":"testdoc70","type":"item","kind":"task","title":"Improve 404 page UX","createdDate":"2025-11-09T09:00:00.000Z","updatedDate":"2025-11-09T12:00:00.000Z","dueDate":"2025-11-15T09:00:00.000Z","doneDate":"2025-11-16T15:30:00.000Z"} ,
    {"_id":"testdoc71","type":"item","kind":"task","title":"Introduce rate limiting","createdDate":"2025-11-10T09:00:00.000Z","updatedDate":"2025-11-10T12:00:00.000Z","dueDate":null,"doneDate":"2025-11-14T15:30:00.000Z"} ,
    {"_id":"testdoc72","type":"item","kind":"task","title":"Rebuild Docker images","createdDate":"2025-11-11T09:00:00.000Z","updatedDate":"2025-11-11T12:00:00.000Z","dueDate":"2025-11-17T09:00:00.000Z","doneDate":"2025-11-18T15:30:00.000Z"} ,
    {"_id":"testdoc73","type":"item","kind":"task","title":"Stress test message queue","createdDate":"2025-11-12T09:00:00.000Z","updatedDate":"2025-11-12T12:00:00.000Z","dueDate":"2025-11-16T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc74","type":"item","kind":"task","title":"Normalize DB schemas","createdDate":"2025-11-13T09:00:00.000Z","updatedDate":"2025-11-13T12:00:00.000Z","dueDate":"2025-11-19T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc75","type":"item","kind":"task","title":"Create incident postmortem","createdDate":"2025-11-14T09:00:00.000Z","updatedDate":"2025-11-14T12:00:00.000Z","dueDate":"2025-11-20T09:00:00.000Z","doneDate":"2025-11-21T15:30:00.000Z"} ,
    {"_id":"testdoc76","type":"item","kind":"task","title":"Refine search ranking","createdDate":"2025-11-15T09:00:00.000Z","updatedDate":"2025-11-15T12:00:00.000Z","dueDate":null,"doneDate":"2025-11-19T15:30:00.000Z"} ,
    {"_id":"testdoc77","type":"item","kind":"task","title":"Ship dark mode","createdDate":"2025-11-16T09:00:00.000Z","updatedDate":"2025-11-16T12:00:00.000Z","dueDate":"2025-11-20T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc78","type":"item","kind":"task","title":"Add ARIA labels","createdDate":"2025-11-17T09:00:00.000Z","updatedDate":"2025-11-17T12:00:00.000Z","dueDate":"2025-11-23T09:00:00.000Z","doneDate":"2025-11-24T15:30:00.000Z"} ,
    {"_id":"testdoc79","type":"item","kind":"task","title":"Triage flaky tests","createdDate":"2025-11-18T09:00:00.000Z","updatedDate":"2025-11-18T12:00:00.000Z","dueDate":null,"doneDate":"2025-11-22T15:30:00.000Z"} ,
    {"_id":"testdoc80","type":"item","kind":"task","title":"Implement soft deletes","createdDate":"2025-11-19T09:00:00.000Z","updatedDate":"2025-11-19T12:00:00.000Z","dueDate":"2025-11-25T09:00:00.000Z","doneDate":"2025-11-26T15:30:00.000Z"} ,
    {"_id":"testdoc81","type":"item","kind":"task","title":"P95 latency review","createdDate":"2025-11-20T09:00:00.000Z","updatedDate":"2025-11-20T12:00:00.000Z","dueDate":null,"doneDate":"2025-11-24T15:30:00.000Z"} ,
    {"_id":"testdoc82","type":"item","kind":"task","title":"Warm up cache strategy","createdDate":"2025-11-21T09:00:00.000Z","updatedDate":"2025-11-21T12:00:00.000Z","dueDate":"2025-11-27T09:00:00.000Z","doneDate":"2025-11-28T15:30:00.000Z"} ,
    {"_id":"testdoc83","type":"item","kind":"task","title":"Consolidate NPM workspaces","createdDate":"2025-11-22T09:00:00.000Z","updatedDate":"2025-11-22T12:00:00.000Z","dueDate":"2025-11-26T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc84","type":"item","kind":"task","title":"Remove jQuery remnants","createdDate":"2025-11-23T09:00:00.000Z","updatedDate":"2025-11-23T12:00:00.000Z","dueDate":"2025-11-29T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc85","type":"item","kind":"task","title":"Set up SLO dashboards","createdDate":"2025-11-24T09:00:00.000Z","updatedDate":"2025-11-24T12:00:00.000Z","dueDate":"2025-11-30T09:00:00.000Z","doneDate":"2025-12-01T15:30:00.000Z"} ,
    {"_id":"testdoc86","type":"item","kind":"task","title":"Encrypt S3 buckets","createdDate":"2025-11-25T09:00:00.000Z","updatedDate":"2025-11-25T12:00:00.000Z","dueDate":null,"doneDate":"2025-11-29T15:30:00.000Z"} ,
    {"_id":"testdoc87","type":"item","kind":"task","title":"Set up blue/green deploys","createdDate":"2025-11-26T09:00:00.000Z","updatedDate":"2025-11-26T12:00:00.000Z","dueDate":"2025-11-30T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc88","type":"item","kind":"task","title":"Write cookie consent banner","createdDate":"2025-11-27T09:00:00.000Z","updatedDate":"2025-11-27T12:00:00.000Z","dueDate":"2025-12-03T09:00:00.000Z","doneDate":"2025-12-04T15:30:00.000Z"} ,
    {"_id":"testdoc89","type":"item","kind":"task","title":"Segment power users","createdDate":"2025-11-28T09:00:00.000Z","updatedDate":"2025-11-28T12:00:00.000Z","dueDate":null,"doneDate":"2025-12-02T15:30:00.000Z"} ,
    {"_id":"testdoc90","type":"item","kind":"task","title":"Decommission legacy cronjobs","createdDate":"2025-11-29T09:00:00.000Z","updatedDate":"2025-11-29T12:00:00.000Z","dueDate":"2025-12-05T09:00:00.000Z","doneDate":"2025-12-06T15:30:00.000Z"} ,
    {"_id":"testdoc91","type":"item","kind":"task","title":"Set up feature telemetry","createdDate":"2025-11-30T09:00:00.000Z","updatedDate":"2025-11-30T12:00:00.000Z","dueDate":null,"doneDate":"2025-12-04T15:30:00.000Z"} ,
    {"_id":"testdoc92","type":"item","kind":"task","title":"Optimize cold starts","createdDate":"2025-12-01T09:00:00.000Z","updatedDate":"2025-12-01T12:00:00.000Z","dueDate":"2025-12-07T09:00:00.000Z","doneDate":"2025-12-08T15:30:00.000Z"} ,
    {"_id":"testdoc93","type":"item","kind":"task","title":"Instrument tracing spans","createdDate":"2025-12-02T09:00:00.000Z","updatedDate":"2025-12-02T12:00:00.000Z","dueDate":"2025-12-06T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc94","type":"item","kind":"task","title":"Add idempotency keys","createdDate":"2025-12-03T09:00:00.000Z","updatedDate":"2025-12-03T12:00:00.000Z","dueDate":"2025-12-09T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc95","type":"item","kind":"task","title":"Lint SQL queries","createdDate":"2025-12-04T09:00:00.000Z","updatedDate":"2025-12-04T12:00:00.000Z","dueDate":"2025-12-10T09:00:00.000Z","doneDate":"2025-12-11T15:30:00.000Z"} ,
    {"_id":"testdoc96","type":"item","kind":"task","title":"Partition audit tables","createdDate":"2025-12-05T09:00:00.000Z","updatedDate":"2025-12-05T12:00:00.000Z","dueDate":null,"doneDate":"2025-12-09T15:30:00.000Z"} ,
    {"_id":"testdoc97","type":"item","kind":"task","title":"Compress media uploads","createdDate":"2025-12-06T09:00:00.000Z","updatedDate":"2025-12-06T12:00:00.000Z","dueDate":"2025-12-10T09:00:00.000Z","doneDate":null} ,
    {"_id":"testdoc98","type":"item","kind":"task","title":"Introduce canary releases","createdDate":"2025-12-07T09:00:00.000Z","updatedDate":"2025-12-07T12:00:00.000Z","dueDate":"2025-12-13T09:00:00.000Z","doneDate":"2025-12-14T15:30:00.000Z"} ,
    {"_id":"testdoc99","type":"item","kind":"task","title":"Set up error budgets","createdDate":"2025-12-08T09:00:00.000Z","updatedDate":"2025-12-08T12:00:00.000Z","dueDate":null,"doneDate":"2025-12-12T15:30:00.000Z"} ,
    {"_id":"testdoc100","type":"item","kind":"task","title":"Automate schema migrations","createdDate":"2025-12-09T09:00:00.000Z","updatedDate":"2025-12-09T12:00:00.000Z","dueDate":"2025-12-15T09:00:00.000Z","doneDate":"2025-12-16T15:30:00.000Z"} ,
  ]

  for (let sample of samples) {
    await db.put(sample)
  }
}

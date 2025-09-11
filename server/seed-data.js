import { db } from './database.js'

const itemKinds = ['note', 'task', 'bookmark', 'idea', 'reminder', 'journal']
const sampleTitles = [
  'Morning coffee thoughts',
  'Review quarterly metrics',
  'Plan weekend trip',
  'Debug authentication issue',
  'Read about async patterns',
  'Grocery shopping list',
  'Call dentist for appointment',
  'Refactor user service',
  'Practice piano scales',
  'Research investment options',
  'Write blog post draft',
  'Fix broken test suite',
  'Organize photo library',
  'Learn about web security',
  'Plan birthday party',
  'Update documentation',
  'Exercise routine ideas',
  'Book restaurant reservation',
  'Code review feedback',
  'Garden maintenance tasks',
  'Study language lessons',
  'Backup important files',
  'Meeting notes compilation',
  'Recipe experiments',
  'Travel itinerary planning',
  'Home improvement ideas',
  'Budget planning session',
  'Creative writing prompt',
  'Technical architecture review',
  'Personal goal setting',
  'Family event coordination',
  'Skill development plan',
  'Market research findings',
  'Health checkup scheduling',
  'Project milestone tracking',
  'Networking event followup',
  'Content creation ideas',
  'Equipment maintenance log',
  'Learning resource curation',
  'Time management strategies'
]

// Generate random datetime within last 30 days
function randomRecentDate() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))
  const randomTime = thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime())
  return new Date(randomTime).toISOString()
}

// Generate random datetime for updated (after created)
function randomUpdatedDate(createdDate) {
  const created = new Date(createdDate)
  const now = new Date()
  const randomTime = created.getTime() + Math.random() * (now.getTime() - created.getTime())
  return new Date(randomTime).toISOString()
}

function seedDatabase() {
  console.log('Seeding database with 100 random items...')
  
  const insertItem = db.prepare('INSERT INTO items (kind, title) VALUES (?, ?)')
  const insertTimestamp = db.prepare('INSERT INTO timestamps (item_id, kind, datetime) VALUES (?, ?, ?)')
  
  // Generate 100 items
  for (let i = 0; i < 100; i++) {
    const kind = itemKinds[Math.floor(Math.random() * itemKinds.length)]
    const title = sampleTitles[Math.floor(Math.random() * sampleTitles.length)]
    const createdAt = randomRecentDate()
    const updatedAt = randomUpdatedDate(createdAt)
    
    // Insert item
    const result = insertItem.run(kind, title)
    const itemId = result.lastInsertRowid
    
    // Insert timestamps
    insertTimestamp.run(itemId, 'created', createdAt)
    insertTimestamp.run(itemId, 'updated', updatedAt)
    
    // Randomly add some additional timestamps for variety
    if (Math.random() < 0.3) { // 30% chance
      const dueDate = new Date(new Date(createdAt).getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString()
      insertTimestamp.run(itemId, 'due', dueDate)
    }
    
    if (Math.random() < 0.2) { // 20% chance
      const completedDate = randomUpdatedDate(updatedAt)
      insertTimestamp.run(itemId, 'completed', completedDate)
    }
    
    if (i % 10 === 0) {
      console.log(`Inserted ${i + 1} items...`)
    }
  }
  
  console.log('✅ Successfully seeded 100 items!')
  
  // Show some stats
  const itemCount = db.prepare('SELECT COUNT(*) as count FROM items').get().count
  const timestampCount = db.prepare('SELECT COUNT(*) as count FROM timestamps').get().count
  
  console.log(`Total items: ${itemCount}`)
  console.log(`Total timestamps: ${timestampCount}`)
}


seedDatabase()
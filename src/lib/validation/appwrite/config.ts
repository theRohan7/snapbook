
import { Client, Account, Databases, Storage, Avatars} from 'appwrite';

export const appwriteConfig = {
projectId: import.meta.env.VITE_APP_PROJECT_ID,
url: import.meta.env.VITE_APP_URL,
databaseId: import.meta.env.VITE_APP_DATABASE_ID,
storageId: import.meta.env.VITE_APP_STORAGE_ID,
userCollectionId: import.meta.env.VITE_APP_USERS_COLLECTION_ID,
postCollectionId: import.meta.env.VITE_APP_POSTS_COLLECTION_ID,
savesCollectionId: import.meta.env.VITE_APP_SAVES_COLLECTION_ID,
}

export const client = new Client()
.setProject('65f3fb0be75edda524aa')
.setEndpoint(`https://cloud.appwrite.io/v1`)
 



export  const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);


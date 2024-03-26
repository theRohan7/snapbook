import { ID, Query } from "appwrite";
import { INewPost, INewUser, IUpdatePost, IUpdateUser } from "@/types";
import { account,  avatars, databases, storage } from "./config";




export async function createUserAccount(user: INewUser) {

    try {
        const newAccount = await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name
        )

        if (!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(user.name)

        const newUser = await saveUserToDB({
            accountId:newAccount.$id,
            name: newAccount.name,
            email: newAccount.email,
            username: user.username,
            imageUrl: avatarUrl,
        })
        return newUser;

    } catch (error) {
        console.log(error)
        return error
    }

}

export async function saveUserToDB(user:{
    accountId: string;
    email: string;
    name: string;
    imageUrl: URL;
    username?:string;
}) {
    try {
        const newUser = await databases.createDocument(
            '65f6aade1e63cac61df6', //Database ID
            '65f6ab377a65d69a74fd', //Users Collection ID
            ID.unique(),
            user,)

            return newUser
        
    } catch (error) {
        console.log(error)
    }
    
}

export async function signInAccount(user:{email:string; password:string}){
    try {
        const session = await account.createEmailSession(user.email, user.password)

        return session
    } catch (error) {
        console.log(error)
    }
}

export async function getCurrentUser() {
    try {
        const currentAccount = await account.get();

        if(!currentAccount) throw Error;

        const CurrentUser  = await databases.listDocuments(
            '65f6aade1e63cac61df6',//Database Collection ID
            '65f6ab377a65d69a74fd', //Users Collection ID
            [Query.equal('accountId', currentAccount.$id)]
        )
        if (!CurrentUser) throw Error

        return CurrentUser.documents[0];
    } catch (error) {
      console.log(error)  
      console.log('error here')
    }
}

export async function signOutAccount(){
    try {
        const session = await account.deleteSession('current');
        console.log('reached here')

        return session;
    } catch (error) {
        console.log(error)
    }
}

export async function createPost(post: INewPost){
    try {
        //upload image to storage
        const uploadedFile = await uploadFile(post.file[0]);
        if (!uploadedFile) throw Error
        
        //Get file URL
        const fileUrl = getFilePreview(uploadedFile.$id)

        if(!fileUrl){
            deleteFile(uploadedFile.$id)
            throw Error
        };

        //convert tags into an array
        const tags = post.tags?.replace(/ /g,'').split(',') || [];


        //save post to database

        const newPost = await databases.createDocument(
            '65f6aade1e63cac61df6', //DatabaseID
            '65f6ab149d93b229341e', // Post Collection ID
            ID.unique(),
            {
                creator: post.userId,
                caption: post.caption,
                imageUrl: fileUrl,
                imageId: uploadedFile.$id,
                location: post.location,
                tags: tags
            }
        )

        if(!newPost){
            await deleteFile(uploadedFile.$id)
            throw Error
        }

        return newPost;

    } catch (error) {
        console.log(error)
    }
}

export async function uploadFile(file:File) {
    try {
        const uploadedFile = await storage.createFile(
            '65f6aaa4afdc1611899b', //BucketID  65f6aaa4afdc1611899b
            ID.unique(),
            file,
        );
        return uploadedFile;
    } catch (error) {
        console.log(error);
        
    }
}

export function getFilePreview(fileId: string) {
    try {
      const fileUrl = storage.getFilePreview(
        '65f6aaa4afdc1611899b',  //Storage ID
        fileId,
        2000,
        2000,
        "top",
        100
      );
  
      if (!fileUrl) throw Error;
  
      return fileUrl;
    } catch (error) {
      console.log(error);
    }
}

export async function deleteFile(fileId:string) {
    try {
        await storage.deleteFile(
        '65f6aaa4afdc1611899b', //storageID
        fileId,
        )
        return {status: 'ok'}
        
    } catch (error) {
        console.log(error)
    }
}

export async function getRecentPosts() {
    try {
      const posts = await databases.listDocuments(
         '65f6aade1e63cac61df6', //Database ID
         '65f6ab149d93b229341e',  //Posts collection ID
        [Query.orderDesc("$createdAt"), Query.limit(20)]
      );
  
      if (!posts) throw Error;
  
      return posts;
    } catch (error) {
      console.log(error);
    }
}

export async function likePost(postId: string, likesArray: string[]){
    try {
        const updatedPost =  await databases.updateDocument(
            '65f6aade1e63cac61df6',  //DatabaseID
            '65f6ab149d93b229341e',  // Posts collection ID
            postId,
            {
                likes: likesArray
            }
        )
        if(!updatedPost) throw  Error;

        return updatedPost
    } catch (error) {
        console.log(error)
    }
}

export async function savePost(postId: string, userID: string){
    try {
        const updatedPost =  await databases.createDocument(
            '65f6aade1e63cac61df6',  //DatabaseID
            '65f6ab566eb17f97b802',  // saves collection ID
            ID.unique(),
            {
                user: userID,
                post: postId
            }
        )
        if(!updatedPost) throw  Error;

        return updatedPost
    } catch (error) {
        console.log(error)
    }
}

export async function deleteSavedPost(savedRecordId: string){
    try {
        const statusCode =  await databases.deleteDocument(
            '65f6aade1e63cac61df6',  //DatabaseID
            '65f6ab566eb17f97b802',  // saves collection ID
            savedRecordId
        )
        if(!statusCode) throw  Error;

        return {status: 'ok'}
    } catch (error) {
        console.log(error)
    }
}

export async function getPostById(postId: string){
    try {
        const post = await databases.getDocument(
            '65f6aade1e63cac61df6',  //Database collectionId
            '65f6ab149d93b229341e',  // Posts collection ID
            postId
        )

        return post
        
    } catch (error) {
        console.log(error)
    }
}

export async function updatePost(post: IUpdatePost){
    const hasFileToUpdate = post.file.length >0;
    try {

        let image = {
            imageUrl: post.imageUrl,
            imageId: post.imageId
        }

        if(hasFileToUpdate){

            //upload image to storage
            const uploadedFile = await uploadFile(post.file[0]);
            if (!uploadedFile) throw Error
            
            //Get file URL
            const fileUrl = getFilePreview(uploadedFile.$id)
    
            if(!fileUrl){
                deleteFile(uploadedFile.$id)
                throw Error
            };
            image = {...image, imageUrl: fileUrl, imageId: uploadedFile.$id}
        }

        //convert tags into an array
        const tags = post.tags?.replace(/ /g,'').split(',') || [];


        //save post to database

        const updatedPost = await databases.updateDocument(
            '65f6aade1e63cac61df6', //DatabaseID
            '65f6ab149d93b229341e', // Post Collection ID
            post.postId,
            {
               
                caption: post.caption,
                imageUrl: image.imageUrl,
                imageId: image.imageId,
                location: post.location,
                tags: tags
            }
        )

        if(!updatedPost){
            await deleteFile(post.imageId)
            throw Error
        }

        return updatedPost;

    } catch (error) {
        console.log(error)
    }
}

export async function deletePost(postId: string, imageId: string){
    if(!postId || imageId) throw Error;

    try {
        await databases.deleteDocument(
            '65f6aade1e63cac61df6', //Database Id
            '65f6ab149d93b229341e', //  Posts Collection Id
            postId
        )

        return {status: 'ok'}
    } catch (error) {
        console.log(error)
    }
}

export async function getInfinitePosts({pageParam}: {pageParam: number}){
    const queries: any[] = [Query.orderDesc('$updatedAt'), Query.limit(10)]
    
    if(pageParam){
        queries.push(Query.cursorAfter(pageParam.toString()));
    }
    try {
        const posts = await databases.listDocuments(
            '65f6aade1e63cac61df6', //Database Id
            '65f6ab149d93b229341e', // Posts Collection ID
            queries
        )

        if(!posts) throw Error

        return posts;
    } catch (error) {
        console.log(error)
    }
}


export async function getSearchPosts(searchTerm: string){
    
    try {
        const posts = await databases.listDocuments(
            '65f6aade1e63cac61df6', //Database Id
            '65f6ab149d93b229341e', // Posts Collection ID
            [Query.search('caption', searchTerm)]
        )

        if(!posts) throw Error

        return posts;
    } catch (error) {
        console.log(error)
    }
}

export async function getUsers(limit?: number) {
    const queries: any[] = [Query.orderDesc("$createdAt")];
  
    if (limit) {
      queries.push(Query.limit(limit));
    }
  
    try {
      const users = await databases.listDocuments(
        '65f6aade1e63cac61df6', //Database Colllection ID
        '65f6ab377a65d69a74fd', // Users Collectio Id
        queries
      );
  
      if (!users) throw Error;
  
      return users;
    } catch (error) {
      console.log(error);
    }
}

export async function getUserById(userId: string) {
    try {
      const user = await databases.getDocument(
        '65f6aade1e63cac61df6', //Database Colllection ID
        '65f6ab377a65d69a74fd', // Users Collectio Id
        userId
      );
  
      if (!user) throw Error;
  
      return user;
    } catch (error) {
      console.log(error);
    }
  }

  export async function updateUser(user: IUpdateUser) {
    const hasFileToUpdate = user.file.length > 0;
    try {
      let image = {
        imageUrl: user.imageUrl,
        imageId: user.imageId,
      };
  
      if (hasFileToUpdate) {
        // Upload new file to appwrite storage
        const uploadedFile = await uploadFile(user.file[0]);
        if (!uploadedFile) throw Error;
  
        // Get new file url
        const fileUrl = getFilePreview(uploadedFile.$id);
        if (!fileUrl) {
          await deleteFile(uploadedFile.$id);
          throw Error;
        }
  
        image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
      }
  
      //  Update user
      const updatedUser = await databases.updateDocument(
        '65f6aade1e63cac61df6', //Database Colllection ID
        '65f6ab377a65d69a74fd', // Users Collectio Id
        user.userId,
        {
          name: user.name,
          bio: user.bio,
          imageUrl: image.imageUrl,
          imageId: image.imageId,
        }
      );
  
      // Failed to update
      if (!updatedUser) {
        // Delete new file that has been recently uploaded
        if (hasFileToUpdate) {
          await deleteFile(image.imageId);
        }
        // If no new file uploaded, just throw error
        throw Error;
      }
  
      // Safely delete old file after successful update
      if (user.imageId && hasFileToUpdate) {
        await deleteFile(user.imageId);
      }
  
      return updatedUser;
    } catch (error) {
      console.log(error);
    }
  }
  

import { Models } from "appwrite"
import Loader from "./Loader";
import GridPostList from "./GridPostList";

type searchResultsProps = {
    isSearchFetching: boolean
    searchedPosts: Models.Document[];

}
const SearchResults = ({isSearchFetching, searchedPosts}: searchResultsProps) => {
   
  if(isSearchFetching) return <Loader />

  if(searchedPosts && searchedPosts.documents.length > 0 ){ 
    return (
      <GridPostList posts={searchedPosts.documents}/>
    )
  }

  return (
    <div>
      <p className="text-light-4 mt-10 w-full text-center">{`No results found :(`}</p>
    </div>
  )
}

export default SearchResults

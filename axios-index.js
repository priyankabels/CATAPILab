import * as Carousel from "./Carousel.js";
//import axios from "axios";

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

// Step 0: Store your API key here for reference and easy access.
const API_KEY = "";

axios.defaults.baseURL="https://api.thecatapi.com/v1";
axios.defaults.headers.common["x-api-key"]=API_KEY;

/**
 * 1. Create an async function "initialLoad" that does the following:
 * - Retrieve a list of breeds from the cat API using fetch().
 * - Create new <options> for each of these breeds, and append them to breedSelect.
 *  - Each option should have a value attribute equal to the id of the breed.
 *  - Each option should display text equal to the name of the breed.
 * This function should execute immediately.
 */
async function initialLoad()
{
    try{
        breedSelect.value="abys";
        Carousel.clear();

        const response = await axios.get('/breeds');
        const breeds=response.data;
        //console.log(data);
        breeds.forEach(breed => {
            const option=document.createElement("option");
            option.value=breed.id;
            option.textContent=breed.name;
            breedSelect.appendChild(option)
            
        });
        getBreedInfo()
    }
    catch(err)
    {
        console.log(err)
    }
}
initialLoad()



/**
 * 2. Create an event handler for breedSelect that does the following:
 * - Retrieve information on the selected breed from the cat API using fetch().
 *  - Make sure your request is receiving multiple array items!
 *  - Check the API documentation if you're only getting a single object.
 * - For each object in the response array, create a new element for the carousel.
 *  - Append each of these new elements to the carousel.
 * - Use the other data you have been given to create an informational section within the infoDump element.
 *  - Be creative with how you create DOM elements and HTML.
 *  - Feel free to edit index.html and styles.css to suit your needs, but be careful!
 *  - Remember that functionality comes first, but user experience and design are important.
 * - Each new selection should clear, re-populate, and restart the Carousel.
 * - Add a call to this function to the end of your initialLoad function above to create the initial carousel.
 */
breedSelect.addEventListener("change",getBreedInfo);
//https://api.thecatapi.com/v1/images/search?breed_ids=beng
async function getBreedInfo()
{
    console.log(breedSelect.value) //This holds ID of the slected option
    let breedInfo=[];
    //Add axios interceptor
    //* Request interceptor
    axios.interceptors.request.use(request => {
        //In your request interceptor, set the width of the progressBar element to 0%.
        progressBar.style.width="0%";

        //At the time request is in progress set style to progress
        document.body.style="progress"
        request.metadata = request.metadata || {};
        request.metadata.startTime = new Date().getTime();
        console.log('Request started at:', new Date(request.metadata.startTime).toLocaleString());
        return request;
    },
    (error) => {
        //If error sending request set the progress bar style to default
        document.body.style.cursor="default";
        throw error;
    });

//* Response interceptor
axios.interceptors.response.use(
    (response) => {
        response.config.metadata.endTime = new Date().getTime();
        response.durationInMS = response.config.metadata.endTime - response.config.metadata.startTime;

        console.log('Response received at:', new Date(response.config.metadata.endTime).toLocaleString());
             //At the time response is recieved set style to default as request is completed
        document.body.style="default"
        return response;
    },
    (error) => {
        //If error sending request set the progress bar style to default
        document.body.style.cursor="default";
        error.config.metadata.endTime = new Date().getTime();
        error.durationInMS = error.config.metadata.endTime - error.config.metadata.startTime;
        throw error;
});
     let response = await axios.get('/images/search?', {
        params: {
            limit: 10,
            breed_ids: breedSelect.value,
        },
        onDownloadProgress:updateProgress,
        
    })
    .then(response => {
        // Extract and log the response time
        console.log("Response Time in MS: ", response.durationInMS);
        console.log('Data:', response.data);

        breedInfo=response.data;
        
        console.log('Data:', breedInfo);
    })
    .catch(error => {
        console.error('Error:', error);
    });
    
//While loading check if marked as favourite if yes then handle it 
    const favouritesList=await axios.get("/favourites");
    const favourites=favouritesList.data;
    // logResponse(response);

    //Getting Carousel and Info Dump to clear it always when change event fires and load based on selected breed
    const infoDump = document.getElementById("infoDump");
    const carousel=document.getElementById("carouselInner");
    Carousel.clear()

    infoDump.innerHTML="";
    carousel.innerHTML="";
    
    if(breedInfo!=null)
    {
        breedInfo.forEach((breedObj)=>{
            //Check if isFavourite and send flag to Carousel accordiingly
            let isFavourite = favourites.some(fav => fav.image.id === breedObj.id);
            console.log("IsFavourite while load",isFavourite)
            Carousel.appendCarousel(Carousel.createCarouselItem(breedObj.url,"Cat Image",breedObj.id,isFavourite));
      });

    }
   
if (breedInfo && breedInfo[0] && breedInfo[0].breeds && breedInfo[0].breeds[0]) {
    const breed = breedInfo[0].breeds[0];

    // Create and populate breed name section
    const pName = document.createElement("p");
    pName.innerHTML = `<b>${breed.name}</b>`;
    pName.style.fontSize = "larger";
    infoDump.appendChild(pName);

    // Create and populate breed description section
    const pDescription = document.createElement("p");
    pDescription.textContent = breed.description || "Description not available";
    infoDump.appendChild(pDescription);

    // Create a table to display other breed details
    const table = document.createElement("table");
    const tr1 = document.createElement("tr");

    // Create and append "Origin" row
    const td1tr1 = document.createElement("td");
    td1tr1.innerHTML = `<b>Origin</b>`;
    tr1.appendChild(td1tr1);

    const td2tr1 = document.createElement("td");
    td2tr1.textContent = breed.origin || "Origin not available";
    tr1.appendChild(td2tr1);

    table.appendChild(tr1);
    infoDump.appendChild(table);
    //  Create and append "Wikipedia URL" row
    const tr2 = document.createElement("tr");
    const td1tr2 = document.createElement("td");
    td1tr2.innerHTML = `<b>Wikipedia URL</b>`;
    tr2.appendChild(td1tr2);

    const td2tr2 = document.createElement("td");
    td2tr2.textContent = breed.wikipedia_url || "Wikipedia URL not available";
    tr2.appendChild(td2tr2);

    table.appendChild(tr2);

     //  Create and append "Life Span" row
     const tr3 = document.createElement("tr");
     const td1tr3 = document.createElement("td");
     td1tr3.innerHTML = `<b>Life Span</b>`;
     tr3.appendChild(td1tr3);
 
     const td2tr3 = document.createElement("td");
     td2tr3.textContent = breed.life_span || "Life Span not available";
     tr3.appendChild(td2tr3);
     table.appendChild(tr3);
       //  Create and append "Temperament" row
       const tr4 = document.createElement("tr");
       const td1tr4 = document.createElement("td");
       td1tr4.innerHTML = `<b>Temperament</b>`;
       tr4.appendChild(td1tr4);
   
       const td2tr4 = document.createElement("td");
       td2tr4.textContent = breed.temperament || "Temperament not available";
       tr4.appendChild(td2tr4);
       table.appendChild(tr4);
    //  Create and append "Weight" row
    const tr5 = document.createElement("tr");
    const td1tr5 = document.createElement("td");
    td1tr5.innerHTML = `<b>Weight</b>`;
    tr5.appendChild(td1tr5);

    const td2tr5 = document.createElement("td");
    td2tr5.innerHTML=`<b>Imperial</b>:${breed.weight["imperial"]}<span></span><b>Metric</b>: ${breed.weight["metric"]}`
    tr5.appendChild(td2tr5)
   
    table.appendChild(tr5);
   
    infoDump.appendChild(table);

    // Optional: Add some basic styling to the table
    table.style.borderCollapse = "collapse";
    table.style.marginTop = "10px";
    table.style.width = "60%";
    table.querySelectorAll("td").forEach(td => {
        td.style.padding = "8px";
        td.style.border = "1px solid #ddd";
    });
} else {
    infoDump.innerHTML = "Breed information is unavailable.";
}

    Carousel.start()
    //console.log(breedInfo);

}

/**
 * 3. Fork your own sandbox, creating a new one named "JavaScript Axios Lab."
 */
/**
 * 4. Change all of your fetch() functions to axios!
 * - axios has already been imported for you within index.js.
 * - If you've done everything correctly up to this point, this should be simple.
 * - If it is not simple, take a moment to re-evaluate your original code.
 * - Hint: Axios has the ability to set default headers. Use this to your advantage
 *   by setting a default header with your API key so that you do not have to
 *   send it manually with all of your requests! You can also set a default base URL!
 */
/**
 * 5. Add axios interceptors to log the time between request and response to the console.
 * - Hint: you already have access to code that does this!
 * - Add a console.log statement to indicate when requests begin.
 * - As an added challenge, try to do this on your own without referencing the lesson material.
 */

/**
 * 6. Next, we'll create a progress bar to indicate the request is in progress.
 * - The progressBar element has already been created for you.
 *  - You need only to modify its "width" style property to align with the request progress.
 * - In your request interceptor, set the width of the progressBar element to 0%.
 *  - This is to reset the progress with each request.
 * - Research the axios onDownloadProgress config option.
 * - Create a function "updateProgress" that receives a ProgressEvent object.
 *  - Pass this function to the axios onDownloadProgress config option in your event handler.
 * - console.log your ProgressEvent object within updateProgess, and familiarize yourself with its structure.
 *  - Update the progress of the request using the properties you are given.
 * - Note that we are not downloading a lot of data, so onDownloadProgress will likely only fire
 *   once or twice per request to this API. This is still a concept worth familiarizing yourself
 *   with for future projects.
 */

// Function to update the progress bar's width
function updateProgress(progressEvent) {
    // If the total size of the response is available
    if (progressEvent.total) {
      //  the percentage of progress
      const progress = (progressEvent.loaded / progressEvent.total) * 100;
      
      // Update the progress bar width adccording to the percentage calculate
      progressBar.style.width = `${progress}%`;
  
      // Optional: Log the progress event to understand its structure
      console.log("ProgressEvent",progressEvent);
    }
  }

/**
 * 7. As a final element of progress indication, add the following to your axios interceptors:
 * - In your request interceptor, set the body element's cursor style to "progress."
 * - In your response interceptor, remove the progress cursor style from the body element.
 */
/**
 * 8. To practice posting data, we'll create a system to "favourite" certain images.
 * - The skeleton of this function has already been created for you.
 * - This function is used within Carousel.js to add the event listener as items are created.
 *  - This is why we use the export keyword for this function.
 * - Post to the cat API's favourites endpoint with the given ID.
 * - The API documentation gives examples of this functionality using fetch(); use Axios!
 * - Add additional logic to this function such that if the image is already favourited,
 *   you delete that favourite using the API, giving this function "toggle" functionality.
 * - You can call this function by clicking on the heart at the top right of any image.
 */
export async function favourite(imgId,clickedHeart) {
    //const base_url="https://api.thecatapi.com/v1/favourites"
    console.log("Im clicked")
    //let heart=document.getElementById(`[data-img-id="${imgId}"]`);
    const heart = document.querySelector(".favourite-button");
    let isMarkedFavorite=clickedHeart.classList.contains("marked");
    console.log(clickedHeart.classList)
    console.log(isMarkedFavorite);
    try{
        if(isMarkedFavorite)
        {
            
            //Check if the item is already marked as favorite using get 
            console.log("Getting Fav API CALled",imgId)
            const isFavorite=await axios.get("/favourites",{
                params:{
                    image_id:imgId
                }
            })
            if(isFavorite)
            {

                let favId=isFavorite.data[0].id ;  //Gte the favorite ID to delet from API
                console.log("Already marked fav inside IsFav")
                console.log("FavId",favId)
                await axios.delete(`/favourites/${favId}`,{
                    headers:{
                        'Content-Type':'application/json;charset=UTF-8'
                    }
                })
                .then(response=>{console.log(response.data)
                   // heart.style.color="light pink"
                    clickedHeart.classList.remove("marked");
                    console.log(clickedHeart.classList)
                    console.log("Item Deleted")
                })
                .catch(err=>{
                    console.log(err.response.status);
                    console.log(err.response.data)
                })
            }
    }
     else
     {
        console.log("Went inside code to mark fav")
        //Mark as favorite
        console.log(heart);
        let rawBody = JSON.stringify({ 
            "image_id": imgId
             });
            
            const response = await axios.post(
            "/favourites", rawBody,{headers:{
                'Content-Type':'application/json;charset=UTF-8'
            }})
            .then(response=>{console.log(response.data);
               //heart.style.color="red";
               clickedHeart.classList.add("marked");
               console.log(clickedHeart.classList)
            })
            .catch(err=>console.log(err));
        console.log('Image with marked as favorite.',imgId);
        //console.log(response.data)
     }
    }
    catch(err)
    {
        console.log(err);
    }

  
}



/**
 * 9. Test your favourite() function by creating a getFavourites() function.
 * - Use Axios to get all of your favourites from the cat API.
 * - Clear the carousel and display your favourites when the button is clicked.
 *  - You will have to bind this event listener to getFavouritesBtn yourself.
 *  - Hint: you already have all of the logic built for building a carousel.
 *    If that isn't in its own function, maybe it should be so you don't have to
 *    repeat yourself in this section.
 */

getFavouritesBtn.addEventListener("click",favourites)
//This function will give list of all favourites
async function favourites()
{
    //Get all the favorites marked from the API
    try
    {
        Carousel.clear();
        infoDump.innerHTML="";
        const response=await axios.get("/favourites");
        console.log("Fav",response.data)
        if(response.data!=null)
        {
            let favBreedInfo=response.data
            favBreedInfo.forEach(fav=>{
                Carousel.appendCarousel(Carousel.createCarouselItem(fav.image.url,"Cat Image",fav.image.id,true))
            });

                Carousel.start();
           
        }
        else
        {
            console.log("No Favorites  found")
        }
        
    }
    catch(err){
        console.log(err);
    }
}
/**
 * 10. Test your site, thoroughly!
 * - What happens when you try to load the Malayan breed?
 *  - If this is working, good job! If not, look for the reason why and fix it!
 * - Test other breeds as well. Not every breed has the same data available, so
 *   your code should account for this.
 */
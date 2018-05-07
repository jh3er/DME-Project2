// get current number of items in cart and publish to "cart" nav item
function getCartCount(){
	var newCount = localStorage.getItem("pages");
	if(newCount){
		var newCountArray = JSON.parse(newCount);
		$('#cart-count span').text('('+newCountArray.length+')');
	} else {
		$('#cart-count span').text('(0)');		
	}
}

getCartCount();


if( $('.product-page').length ){
	// get current page url
	var curr_product = window.location.pathname;
	// check if there is a pages array, if not create one
	var pages = localStorage.getItem("pages");
	pages = (pages) ? JSON.parse(pages) : [];
	// check if current page item is in the cart already...
	if( $.inArray( curr_product, pages ) !== -1 ){
		// ... if it is, disable the button
		$('.button')
			.addClass('disabled')
			.after('<p class="disabled-notice">This item is already in your cart.</p>')
			.click(function(e){
				e.preventDefault();
			});
	} else {
		// ... else, allow button to function as expected
		$('.button').click(function(e){
			// prevent default behavior
			e.preventDefault();
			// push current page into pages array
			pages.push(curr_product);
			// update pages variable in local storage
			localStorage.setItem("pages", JSON.stringify(pages));
			var newCount = localStorage.getItem("pages");
			var newCountArray = JSON.parse(newCount);
			$('#cart_count span').text(newCountArray.length);
			// redirect to cart
			window.location.href = '../cart.html';
		});
		
	}

	var native_width = 0;
	var native_height = 0;
  $(".largeMag").css("background","url('" + $(".smallMag").attr("src") + "') no-repeat");

	//Now the mousemove function
	$(".magnify").mousemove(function(e){
		//When the user hovers on the image, the script will first calculate
		//the native dimensions if they don't exist. Only after the native dimensions
		//are available, the script will show the zoomed version.
		if(!native_width && !native_height)
		{
			//This will create a new image object with the same image as that in .small
			//We cannot directly get the dimensions from .small because of the 
			//width specified to 200px in the html. To get the actual dimensions we have
			//created this image object.
			var image_object = new Image();
			image_object.src = $(".smallMag").attr("src");
			
			//This code is wrapped in the .load function which is important.
			//width and height of the object would return 0 if accessed before 
			//the image gets loaded.
			native_width = image_object.width;
			native_height = image_object.height;
		}
		else
		{
			//x/y coordinates of the mouse
			//This is the position of .magnify with respect to the document.
			var magnify_offset = $(this).offset();
			//We will deduct the positions of .magnify from the mouse positions with
			//respect to the document to get the mouse positions with respect to the 
			//container(.magnify)
			var mx = e.pageX - magnify_offset.left;
			var my = e.pageY - magnify_offset.top;
			
			//Finally the code to fade out the glass if the mouse is outside the container
			if(mx < $(this).width() && my < $(this).height() && mx > 0 && my > 0)
			{
				$(".largeMag").fadeIn(100);
			}
			else
			{
				$(".largeMag").fadeOut(100);
			}
			if($(".largeMag").is(":visible"))
			{
				//The background position of .large will be changed according to the position
				//of the mouse over the .small image. So we will get the ratio of the pixel
				//under the mouse pointer with respect to the image and use that to position the 
				//large image inside the magnifying glass
				var rx = Math.round(mx/$(".smallMag").width()*native_width - $(".largeMag").width()/2)*-1;
				var ry = Math.round(my/$(".smallMag").height()*native_height - $(".largeMag").height()/2)*-1;
				var bgp = rx + "px " + ry + "px";
				
				//Time to move the magnifying glass with the mouse
				var px = mx - $(".largeMag").width()/2;
				var py = my - $(".largeMag").height()/2;
				//Now the glass moves with the mouse
				//The logic is to deduct half of the glass's width and height from the 
				//mouse coordinates to place it with its center at the mouse coordinates
				
				//If you hover on the image now, you should see the magnifying glass in action
				$(".largeMag").css({left: px, top: py, backgroundPosition: bgp});
			}
		}
	})

}

if( $('.order').length ){
	var pages = localStorage.getItem("pages");
	// check if there is a pages array
	// it is not likely someone would just go to the order page
	// if they did, and the array was not already set up, there could be bad UX
	// this is more of a safeguard
	if(pages){
		// get the array
		pages = JSON.parse(pages);
		// check if there's anything in it
		if (pages.length > 0){
			// allow submit
			$('#submit').click(function(e){
				e.preventDefault();
				// empty cart
				localStorage.clear();
				// go to confirmation page
				window.location.href = 'confirmation.html';	
			});
		} else {
			// don't allow submit
			$('#submit')
				.addClass('disabled')
				.after('<p>There are no items in your cart.</p>')
				.click(function(e){
					e.preventDefault();
				});
		}
	} else {
		// redundant
		$('#submit')
			.addClass('disabled')
			.after('<p>There are no items in your cart.</p>')
			.click(function(e){
				e.preventDefault();
			});
	}
}

if( $('.cart').length ){

	var pages = localStorage.getItem("pages");
	var cart_total = Number(0);
	var sub_total = Number(0);

	// only parse array if there is one
	// avoids errors
	if(pages){
    	var pagesArray = JSON.parse(pages);
	}

	function loadContent(path){
		var request = new XMLHttpRequest();
		request.open('GET', path, true);
		request.onload = function() {
		  if (request.status >= 200 && request.status < 400) {
		  	// Load content from menu.html
		    var resp = request.responseText;
		    // Create parser to filter loadedcontent
		    var parser = new DOMParser();
		    var htmlDoc = parser.parseFromString(resp,"text/html");
		    // Select the heading from content
		    var prod_heading = htmlDoc.querySelector(".product-title").innerHTML;
		    var prod_cat = htmlDoc.querySelector(".product-title").getAttribute("data-cat");
		    // Select the price from content
		    var prod_price = htmlDoc.querySelector(".product-price").innerHTML;
		    //product size
		    //var prod_size = htmlDoc.querySelector(".size").innerHTML;
		    // remove the dollar sign from the price
		    var prod_price_num = prod_price.replace(/[$]/,'');
		    // Select the image from content
		    var prod_image = htmlDoc.querySelector(".product-image").src;
		    // remove path from image file reference
		    var prod_image_name = prod_image.replace(/^.*[\\\/]/, '');
		    // Select the product description from content
		    var prod_desc = htmlDoc.querySelector(".product-description").innerHTML;
		    // Concat all content into entry markup
		    var prod_listing = '<div class="product-listing panel" data-path="'+path+'"><div class="row"><div class="column medium-3"><img src="img/'+prod_cat+'/'+prod_image_name+'"></div><div class="column medium-9"><button class="tiny radius right">Remove</button><h4><a href="'+path+'">'+prod_heading+'</a><br><br></h4><p class="left listPrice">Price</p><h5 class="right">$'+prod_price_num+'</h5><br><br><p class="left desc">'+prod_desc+'</p></div></div></div>';
		    // Append entry to main section
		    $('.cart-content').append(prod_listing);
		    //subtotal
		    sub_total += Number(prod_price_num);
		   	$('#subTotal').html('<span class="detail left">Sub Total</span><span class="right detail">$'+sub_total+'</span>');
		    // Add up cart total
		    cart_total += Math.round((Number(prod_price_num) + Number(prod_price_num*0.075))*100)/100;
		    
		    $('#order-total').html('<span class="order-total-label left">Order Total</span><span class="order-total-amount right">$'+cart_total+'</span>');
		  } else {
		    // We reached our target server, but it returned an error
		    alert("Error 1");
		  }
		};
		request.onerror = function() {
		  // There was a connection error of some sort
		  alert("Error 2");
		};
		request.send();
	}

	// loop over array of entries to print content
	if(pages){
	    for ( var i = 0; i<pagesArray.length; i++ ) {
	      loadContent(pagesArray[i]);
	    }
	} else {
	    console.log('No content, sorry.');
	}

	// handle clicks on individual entries (mechanism for deleting entries)
	$('.cart-content').on('click','button',function(){
		// get current item
		var index = $(this).parents('.product-listing').attr('data-path');
		// identify target in array
		var delete_item = pagesArray.indexOf(index);
		// remove item from array
        pagesArray.splice(delete_item,1);
		// update array ("pages") variable in local storage
		localStorage.setItem("pages", JSON.stringify(pagesArray));
	    // refresh cart
		window.location.href = 'cart.html';		
	});

	// if user goes directly to cart, and there's nothing in it
	// there's nothing in the cart to order
	// disable the order button
	if (!pages||pagesArray.length == 0){
		// disable order button
		$('#order-button a')
			.addClass('disabled')
			.after('<p>There are no items in your cart.</p>')
			.click(function(e){
				e.preventDefault();
			});
	}

}

// saving arrays to local storage
// https://www.kirupa.com/html5/storing_and_retrieving_an_array_from_local_storage.htm

// details on using arrays with local storage
// https://stackoverflow.com/questions/39811896/localstorage-array

// details on get DOM infor from another page
// https://stackoverflow.com/questions/12899047/how-to-use-javascript-to-access-another-pages-elements

// details on getting just the file name from a path
// https://stackoverflow.com/a/423385

function setEqualProductHeight() {
  // set equal minimum height for all products
  // https://stackoverflow.com/a/6061029
  var maxHeight = Math.max.apply(
    null,
    $(".product-wrapper")
      .map(function() {
        return $(this).height();
      })
      .get()
  );
  $(".product-wrapper").css({ "min-height": 140 });
  // $(".product-wrapper").css({ "min-height": maxHeight });
}

$(document).ready(function() {
  // switches for displaying various information
  var showProductCount = true;
  var showLegend = true;
  var showTitle = true;
  var showNavbar = true;
  // configuration files
  var requestCategories = $.getJSON("json/categories.json");
  var requestProducts = $.getJSON("json/products.json");

  $.when(requestCategories, requestProducts)
    .done(function(dataCategories, dataProducts) {
      // count all products
      $("#count-total").html(dataProducts[0].length);

      // Executed when both requests complete successfully
      // Both results are available here

      // create segment for each category in categories.json
      $.each(dataCategories[0], function() {
        currentCategoryShort = this.nameShort;
        currentCategoryLong = this.nameLong;
        currentSubcategories = this.subcategories;
        currentProductNameCount = 0;

        html = `
            <div class="card">
            <div class="category-wrapper" id="${currentCategoryShort}">
            <div class="category-header clearfix">
            ${currentCategoryLong} <span class="counter-text"><span class="count-product">0</span> Produkte</span>
            </div>
            <ul class="list-inline" id="list-${currentCategoryShort}">
            </ul>`;

        // sort subcategories by long name
        if (currentSubcategories !== undefined) {
          currentSubcategories.sort(function(a, b) {
            return a.nameLong.localeCompare(b.nameLong);
          });
        }

        $.each(currentSubcategories, function(index, currentSubcategory) {
          currentSubcategoryShort = currentSubcategory.nameShort;
          currentSubcategoryLong = currentSubcategory.nameLong;
          html += `
                <div class="subcategory-header card-subtitle mb-2 text-muted">
                ${currentSubcategoryLong}
                </div>
                <ul class="list-inline" id="sublist-${currentSubcategoryShort}">
                </ul>`;
        });

        html += `
            </div>
            </div>
            `;
        $("#row-products").append(html);
      });

      // sort products by developer
      // https://stackoverflow.com/a/14208661
      dataProducts[0].sort(function(a, b) {
        return a.developer.localeCompare(b.developer);
      });

      // go through each item in products.json
      $.each(dataProducts[0], function() {
        currentName = this.name;
        currentDeveloper = this.developer;
        currentLogo = this.logo;
        currentLink = this.link;
        currentDescription = this.description;
        currentCategories = this.categories;
        currentDigitalMethodsUsed = this.digitalMethodsUsed;

        // add appropriate css classes for technology readiness level and mediatype
        if (this.functionRange == "") {
          currentFunctionRange = "fr-unknown";
        } else {
          currentFunctionRange = "fr-" + this.functionRange;
        }
        if (this.apptype.length > 1) {
          currentApptype = "apptype-mixed";
        } else {
          currentApptype = "apptype-" + this.apptype;
        }

        // go through each category of the item and add the product to the correspondig section
        $.each(currentCategories, function(
          key,
          currentCategoryWithSubcategory
        ) {
          currentCategoryWithSubcategory = currentCategoryWithSubcategory.split(
            "_"
          );
          currentCategory = currentCategoryWithSubcategory[0];
          currentSubcategory = currentCategoryWithSubcategory[1];

          // only show developer if it isn't the same as the product name
          if (currentDeveloper != currentName) {
            currentProductName =
              currentDeveloper + " <b>" + currentName + "</b>";
          } else {
            currentProductName = "<b>" + currentName + "</b>";
          }

          html = `
                <li class="product-wrapper text-center d-inline-flex ${currentApptype} ${currentFunctionRange}">
                <a href="${currentLink}" title="${currentDescription}" target="_blank" class="product-link w-100 my-auto">
                <img class="logo" src="img/${currentLogo}">
                <span class="product-name">${currentProductName}</span>`;
          $.each(currentDigitalMethodsUsed, function(index, value) {
            if (value != "") {
              html += `<div class="digital-method">${value}</div>`;
            }
          });
          html += `
                </a>
                </li>
                `;

          try {
            // if the current product has no subcategory append it to the superior category
            if (currentSubcategory === undefined) {
              // subcategory is NOT existing
              // add to superior category
              if ($("#list-" + currentCategory).length) {
                $("#list-" + currentCategory).append(html);
              } else {
                // given category is not available!
                throw new Error(
                  "The given category '" +
                    currentCategory +
                    "' for '" +
                    currentName +
                    "' does not exist!"
                );
              }
            } else {
              // subcategory is existing
              if ($("#sublist-" + currentSubcategory).length) {
                $("#sublist-" + currentSubcategory).append(html);
              } else {
                // given category is not available!
                throw new Error(
                  "The given subcategory '" +
                    currentSubcategory +
                    "' for '" +
                    currentName +
                    "' does not exist!"
                );
              }
            }
            setEqualProductHeight();
          } catch (error) {
            console.log(error);
          }

          // increase count of products in current category
          $("#" + currentCategory + " span.count-product").html(
            parseInt(
              $("#" + currentCategory + " span.count-product").html(),
              10
            ) + 1
          );
        });
      });

      // show or hide various information
      if (showProductCount) {
        $(".counter-text").show();
      } else {
        $(".counter-text").hide();
      }
      if (showLegend) {
        $(".row-legend").show();
      } else {
        $(".row-legend").hide();
      }
      if (showNavbar) {
        $("nav").show();
      } else {
        $("nav").hide();
      }
      if (showTitle) {
        $("h1").show();
      } else {
        $("h1").hide();
      }
    })
    .fail(function() {
      // Executed if at least one request fails
    });
});

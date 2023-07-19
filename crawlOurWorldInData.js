const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();

  // Navigate to the page with the paginated table
  await page.goto('https://www.visualcapitalist.com/worlds-plummeting-fertility-rate/');

  // Loop through all pages of the table
  let hasNextPage = true;
  await fs.promises.unlink("./results.csv");
  
  while (hasNextPage) {
    // Get all the data in the current page of the table

    const allRequest = await page.$('table[id*="tablepress"]')

    const tableData = await allRequest.$$eval('tbody tr', rows => {
      return rows.map(row => {
        const cells = row.querySelectorAll('td');
        let baseStrArr = []
        cells.forEach((cell , index)=>{
          if(index === 0 ) return 
          baseStrArr.push(cell.textContent.trim())
        })

        let finalResult = baseStrArr.join(",")+'\n'
        return finalResult
      });
    });

    fs.appendFile('./results.csv', tableData.join("") , (err) => {
      if(err) 
        throw err;
      console.log('The new_content was appended successfully');
    });

    // Do something with the table data, such as saving it to a database

    // Check if there is a next page button
    const nextButton = await page.$('.paginate_button.next');
    
    const IsActive = await page.$(".paginate_button.next.disabled") ? false : true;
    console.log(await page.$(".paginate_button.next.disabled"));
    
    if (IsActive) {
      // Click the next page button
      await nextButton.click();
      // Wait for the next page to load
      await page.waitForSelector('table[id*="tablepress"] tbody tr');
    } else {
      // Stop looping if there is no next page button
      hasNextPage = false;
    }
  }

  await browser.close();
})();

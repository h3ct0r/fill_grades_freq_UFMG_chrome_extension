# Fill Grades And Frequency to UFMG's `Diario de Classe`
## _A simple way to import your class data into the university grading system using a Chrome Extension_

This project is a JS Chrome Extension that works on certain URL's to allow the option of automatically filling students grades and frequency by directly importing a CSV files with the evaluation and frequency data. 

This project also includes a Google Sheets template to import the users from Moodle and `Diario de Classe`, joining them by name. This template can be used to fill the grades during the semester, and export it to CSV.
<div align="center">
  <img src="https://github.com/user-attachments/assets/1b4fb10b-2852-4c5f-8512-db614cc4c756" alt="Extension gui" style="text-align:center; width:25%">
  <br>
  Interface of the plugin once open at the correct `Diario de Classe` webpage.
</div>

<br>

<div align="center">
 <a href="https://www.youtube.com/watch?v=9LEHnoVBfvQ" target="_blank">
      <img src="https://github.com/user-attachments/assets/85984edd-24ee-4ce0-8982-920510993360" alt="Youtube video tutorial" style="text-align:center; width:45%">
    </a>
  <br>
  Quick video tutorial of the plugin doing its magic.
</div>

### Acknowledgements

This project is based upon the developments of:
- [Prof. Flavio Figueiredo](https://dcc.ufmg.br/professor/flavio-vinicius-diniz-de-figueiredo/) and its automatic filler using Python3 https://github.com/flaviovdf/preenche-notas-ufmg
- And the spreadsheets/organization efforts from Prof. [Douglas G. Macharet](https://dcc.ufmg.br/professor/douglas-guimaraes-macharet/).

## Reference Google Sheets template

This project shares a reference Google Sheets template to use with the plugin and make easier to create the CSV files, however its not required and you can use any way you prefer to generate the CSV files.
- Link: https://docs.google.com/spreadsheets/d/1f_me6U-Ha-TknAIA9YQtypiudQb4HLF3AGMMo_i_Prs/edit?usp=sharing

<div align="center">
    <a href="https://docs.google.com/spreadsheets/d/1f_me6U-Ha-TknAIA9YQtypiudQb4HLF3AGMMo_i_Prs/edit?usp=sharing" target="_blank">
      <img src="https://github.com/user-attachments/assets/feec7f8e-29f1-40f7-a53c-7447ca70ef8d" alt="Extension gui" style="text-align:center; width:25%">
    </a>
    <br>
    Reference Google Sheets template.
</div>

## How to install

Download this Github project and load it in Chrome using developer mode as an unpacked extension:

- Go to the Extensions page by entering `chrome://extensions` in a new tab. (By design chrome:// URLs are not linkable.)
    - Alternatively, click the Extensions menu puzzle button and select **Manage Extensions** at the bottom of the menu.
    - Or, click the Chrome menu, hover over **More Tools**, then select **Extensions**.
- Enable **Developer Mode** by clicking the toggle switch next to **Developer mode**.
- Click the **Load unpacked** button and select the extension directory.
  
<div align="center">
  <img src="https://github.com/user-attachments/assets/e805db63-afce-4996-9166-108b12a4675c" alt="Extensions" style="text-align:center; width:25%">
  <br>
  Extensions page (`chrome://extensions`)
</div>
- Ta-da! The extension has been successfully installed.

## Step by step tutorial

Test website at: https://homepages.dcc.ufmg.br/~hector.azpurua/notas_mock
Test CSV data: https://github.com/h3ct0r/fill_grades_freq_UFMG_chrome_extension/blob/main/test_csv_files/test_grades_10.csv

- *Step 0*: Inside `Diario de Classe`, go to the page `Notas/Lançamento de Notas/Todas as Avaliações` and click on the extension icon
<div align="center">
  <img src="https://github.com/user-attachments/assets/6602d9fd-0c56-40f6-8383-c3dbb8652030" alt="Step 0" style="text-align:center; width:25%">
</div>
  
- *Step 1*: Verify that `step 1` is finished with the green mark (this step recognizes the AV columns and matches them with your data)
<div align="center">
  <img src="https://github.com/user-attachments/assets/a0ea29c8-38e1-478e-b03c-30cca312e6b0" alt="Step 1" style="text-align:center; width:25%">
</div>

- *Step 2*: Upload the CSV file, and verify that the CSV fields match with the current AV's in the page (green check on `step 2`)
<div align="center">
  <img src="https://github.com/user-attachments/assets/6325fcc4-38c4-4475-a260-1f40a13873da" alt="Step 2" style="text-align:center; width:25%">
</div>

- *Step 3*: Click on the `Fill Grades` button, and verify the output of number of correctly filled rows
<div align="center">
  <img src="https://github.com/user-attachments/assets/0b4d7a06-0c01-4227-937d-00e78105d2cc" alt="Step 3" style="text-align:center; width:25%">
</div>

- Remember to click the `Processar` button at the bottom of the page to register all grades

## License

MIT

**Free Software, Hell Yeah!**
   

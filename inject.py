import os

# Replace with your actual GA code
GA_TRACKING_CODE = """
<!-- Google tag (gtag.js) -->

<script async src="https://www.googletagmanager.com/gtag/js?id=G-B4XJEB9FFY"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-B4XJEB9FFY');
</script>
"""

def insert_ga_code_into_html(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    if 'gtag(' in content:
        print(f"✔ Google Analytics already exists in {file_path}")
        return

    if "<head>" in content:
        content = content.replace("<head>", f"<head>\n{GA_TRACKING_CODE}", 1)
        with open(file_path, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"✅ Inserted GA code into: {file_path}")
    else:
        print(f"⚠️ No <head> tag found in {file_path}, skipped.")

# Update this to the folder where your HTML files are
directory = "C:\\Users\\PhaniChitta\\OneDrive - Collabridge\\Collabridge_repo\\collabridgewebsite"

for filename in os.listdir(directory):
    if filename.endswith(".html"):
        filepath = os.path.join(directory, filename)
        insert_ga_code_into_html(filepath)

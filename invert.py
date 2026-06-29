from PIL import Image

def invert_icon():
    try:
        # Open the image and convert to RGBA
        img = Image.open('public/icon-logo.png').convert('RGBA')
        
        # Get data
        data = img.getdata()
        
        new_data = []
        for item in data:
            # Change all opaque pixels to white
            if item[3] > 0:
                new_data.append((255, 255, 255, item[3]))
            else:
                new_data.append(item)
                
        # Update image
        img.putdata(new_data)
        
        # Save for Next.js app directory
        img.save('src/app/icon.png')
        print("Success! Created src/app/icon.png")
        
    except Exception as e:
        print(f"Error: {e}")

invert_icon()

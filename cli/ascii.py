from PIL import Image

### ASCII art generator ###

image_path = '../public/logo2.png' # try logo.png, logo3.png, logo3.png, etc.

# Define ASCII characters to use in the art:
ASCII_CHARS = '@%#*+=-:. '

# Resize the image with desired width while keeping the aspect ratio:
def resize_image(image, new_width=100):
    width, height = image.size
    ratio = height / float(width)
    new_height = int(new_width * ratio)
    resized_image = image.resize((new_width, new_height))
    return resized_image

# Convert the grayscale pixel value to ASCII character:
def pixel_to_ascii(gray_value):
    num_chars = len(ASCII_CHARS)
    return ASCII_CHARS[int(gray_value / 255 * (num_chars - 1))]

def main():
    # Load the image and convert it to grayscale:
    try:
        image = Image.open(image_path)
    except Exception as e:
        print("\nError:", e)
        return

    image = resize_image(image)
    grayscale_image = image.convert('L')

    # Convert the grayscale pixels to ASCII characters:
    ascii_art = ''
    for y in range(grayscale_image.size[1]):
        for x in range(grayscale_image.size[0]):
            pixel_value = grayscale_image.getpixel((x, y))
            ascii_art += pixel_to_ascii(pixel_value)
        ascii_art += '\n'

    print(ascii_art)
    
    ask_for_saving = input('Save the ASCII art to a file? (y/n): ')
    if ask_for_saving.lower() == 'y':
        file_name = 'ascii_art.txt'
        try:
            with open(file_name, 'w') as file:
                file.write(ascii_art)
            print(f'\nASCII art saved to {file_name}\n')
        except Exception as e:
            print(f"\nError occurred while saving: {e}\n")
    else:
        print('\nASCII art not saved\n')
    print('\nThanks for using the ASCII art generator!\n')
      

if __name__ == "__main__":
    main()

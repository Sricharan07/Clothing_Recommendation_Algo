import pandas as pd
import numpy as np
import os
import re
from pathlib import Path

# Define path to dataset directory
dataset_dir = Path('/Users/sricharan/Documents/Clothing_Recommendation_Algo/Clozyt DataSet')
output_dir = Path('/Users/sricharan/Documents/Clothing_Recommendation_Algo/ClothingSwipe/data')

# Create output directory if it doesn't exist
os.makedirs(output_dir, exist_ok=True)

# Define common columns for the standardized dataset
std_columns = [
    'id', 'name', 'brand', 'category', 'subcategory', 'color', 
    'price', 'image_url', 'product_url', 'style', 'fit'
]

# Define clothing categories and subcategories for classification
category_keywords = {
    'tops': ['tee', 'top', 'shirt', 'blouse', 'tank', 'cami', 'crop', 'sweater', 'sweatshirt', 'hoodie', 'cardigan', 'tshirt', 't-shirt', 'jacket', 'pullover'],
    'bottoms': ['pant', 'jean', 'legging', 'short', 'skirt', 'trouser', 'jogger', 'chino'],
    'dresses': ['dress', 'romper', 'jumpsuit'],
    'activewear': ['sport', 'bra', 'active', 'gym', 'workout', 'yoga', 'run', 'performance'],
    'outerwear': ['coat', 'jacket', 'bomber', 'denim jacket', 'cardigan', 'puffer'],
    'swimwear': ['swim', 'bikini', 'one piece', 'beach'],
    'accessories': ['hat', 'scarf', 'sock', 'bag', 'purse', 'accessory']
}

# Define subcategories for further classification
subcategory_keywords = {
    'tops': {
        't-shirt': ['tee', 't-shirt', 'tshirt', 't shirt'],
        'blouse': ['blouse', 'button-up', 'button up'],
        'sweater': ['sweater', 'knit', 'pullover'],
        'hoodie': ['hoodie', 'sweatshirt'],
        'tank': ['tank', 'sleeveless', 'cami', 'camisole'],
        'crop top': ['crop', 'cropped'],
        'long sleeve': ['long sleeve', 'longsleeve']
    },
    'bottoms': {
        'jeans': ['jean', 'denim'],
        'leggings': ['legging', 'tight'],
        'shorts': ['short'],
        'skirt': ['skirt', 'mini skirt', 'maxi skirt'],
        'pants': ['pant', 'trouser', 'chino'],
        'joggers': ['jogger', 'sweatpant']
    },
    'dresses': {
        'mini': ['mini'],
        'midi': ['midi'],
        'maxi': ['maxi'],
        'bodycon': ['bodycon', 'body con'],
        'casual': ['casual', 'tshirt dress'],
        'formal': ['formal', 'cocktail']
    },
    'activewear': {
        'sports bra': ['bra', 'sports bra'],
        'leggings': ['legging'],
        'shorts': ['short'],
        'tank': ['tank'],
        'jacket': ['jacket']
    }
}

# Define styles based on keywords and brands
style_keywords = {
    'casual': ['casual', 'basic', 'everyday', 'lounge', 'relaxed', 'tee', 'jeans'],
    'formal': ['formal', 'elegant', 'dress', 'cocktail', 'office'],
    'athletic': ['active', 'sport', 'gym', 'workout', 'yoga', 'run', 'performance'],
    'bohemian': ['boho', 'floral', 'loose', 'flowy', 'maxi'],
    'vintage': ['retro', 'vintage', 'classic', '90s', '80s'],
    'streetwear': ['street', 'urban', 'graphic', 'oversized'],
    'minimalist': ['minimal', 'simple', 'clean', 'basic']
}

brand_styles = {
    'alo yoga': 'athletic',
    'gymshark': 'athletic',
    'vuori': 'athletic',
    'princess polly': 'casual',
    'edikted': 'streetwear',
    'nakd': 'minimalist',
    'cupshe': 'casual',
    'altardstate': 'bohemian'
}

# Function to classify items
def classify_item(row):
    name = str(row.get('name', '')).lower()
    brand = str(row.get('brand', '')).lower() if pd.notna(row.get('brand', '')) else ''
    
    # Determine category
    category = 'other'
    for cat, keywords in category_keywords.items():
        if any(keyword in name.lower() for keyword in keywords):
            category = cat
            break
    
    # Special case for activewear brands
    if brand in ['alo yoga', 'gymshark', 'vuori']:
        if category == 'tops' or category == 'bottoms':
            category = 'activewear'
    
    # Determine subcategory
    subcategory = 'other'
    if category in subcategory_keywords:
        for subcat, keywords in subcategory_keywords[category].items():
            if any(keyword in name.lower() for keyword in keywords):
                subcategory = subcat
                break
    
    # Determine style
    style = 'casual'  # Default style
    for s, keywords in style_keywords.items():
        if any(keyword in name.lower() for keyword in keywords):
            style = s
            break
    
    # Override style based on brand
    if brand in brand_styles:
        style = brand_styles[brand]
    
    # Extract color if not present
    color = row.get('color', '') if pd.notna(row.get('color', '')) else ''
    if not color and 'name' in row:
        # Try to extract color from name
        color_pattern = re.search(r'(black|white|navy|blue|red|green|yellow|pink|purple|grey|gray|brown|tan|beige|olive|ivory|cream|burgundy|teal|orange|gold|silver|denim|khaki|nude|mauve|sage)', name.lower())
        if color_pattern:
            color = color_pattern.group(1)
    
    # Extract fit if not present
    fit = row.get('fit', '') if pd.notna(row.get('fit', '')) else ''
    if not fit:
        if 'oversized' in name.lower():
            fit = 'oversized'
        elif 'slim' in name.lower():
            fit = 'slim'
        elif 'regular' in name.lower():
            fit = 'regular'
        else:
            fit = 'regular'  # default
    
    return pd.Series([category, subcategory, style, color, fit])

# Process each dataset
all_data = []

# 1. Process Alo Yoga dataset
try:
    print("Processing Alo Yoga dataset...")
    df = pd.read_csv(dataset_dir / 'alo_yoga_products.csv')
    df['brand'] = 'Alo Yoga'
    df['id'] = 'alo_' + df.index.astype(str)
    df['color'] = df['current_color'].astype(str)
    
    # Apply classification
    df[['category', 'subcategory', 'style', 'extracted_color', 'fit']] = df.apply(classify_item, axis=1)
    
    # Fill color if extraction was successful and original is empty
    df['color'] = df.apply(lambda x: x['extracted_color'] if (x['color'] == 'nan' or pd.isna(x['color'])) else x['color'], axis=1)
    
    # Format the data for our standard schema
    std_df = pd.DataFrame({
        'id': df['id'],
        'name': df['name'],
        'brand': df['brand'],
        'category': df['category'],
        'subcategory': df['subcategory'],
        'color': df['color'],
        'price': df['price'],
        'image_url': df['image_url'],
        'product_url': df['product_url'],
        'style': df['style'],
        'fit': df['fit']
    })
    
    all_data.append(std_df)
    print(f"Successfully processed {len(df)} Alo Yoga products")
    
except Exception as e:
    print(f"Error processing Alo Yoga dataset: {e}")

# 2. Process Princess Polly dataset
try:
    print("Processing Princess Polly dataset...")
    df = pd.read_csv(dataset_dir / 'princess_polly.csv')
    df['brand'] = 'Princess Polly'
    df['id'] = 'pp_' + df.index.astype(str)
    
    # Extract color from title
    def extract_color_from_title(title):
        # Split the title by spaces and get the last word which is often the color
        parts = title.split()
        if len(parts) > 1:
            return parts[-1]
        return ''
    
    df['color'] = df['title'].apply(extract_color_from_title)
    
    # Apply classification
    df[['category', 'subcategory', 'style', 'extracted_color', 'fit']] = df.apply(classify_item, axis=1)
    
    # Use extracted color if available
    df['color'] = df.apply(lambda x: x['extracted_color'] if x['extracted_color'] else x['color'], axis=1)
    
    # Format the data for our standard schema
    std_df = pd.DataFrame({
        'id': df['id'],
        'name': df['title'],
        'brand': df['brand'],
        'category': df['category'],
        'subcategory': df['subcategory'],
        'color': df['color'],
        'price': df['price'],
        'image_url': df['image_url'],
        'product_url': df['product_url'],
        'style': df['style'],
        'fit': df['fit']
    })
    
    all_data.append(std_df)
    print(f"Successfully processed {len(df)} Princess Polly products")
    
except Exception as e:
    print(f"Error processing Princess Polly dataset: {e}")

# 3. Process Gymshark dataset
try:
    print("Processing Gymshark dataset...")
    df = pd.read_csv(dataset_dir / 'gymshark_products.csv')
    df['brand'] = 'Gymshark'
    df['id'] = 'gs_' + df['product_id'].astype(str)
    
    # Apply classification
    df[['category', 'subcategory', 'style', 'extracted_color', 'fit']] = df.apply(classify_item, axis=1)
    
    # Format the data for our standard schema
    std_df = pd.DataFrame({
        'id': df['id'],
        'name': df['name'],
        'brand': df['brand'],
        'category': df['category'],
        'subcategory': df['subcategory'],
        'color': df['color'],
        'price': df['price'],
        'image_url': df['image_url'],
        'product_url': df['url'],
        'style': df['style'],
        'fit': df['fit']
    })
    
    all_data.append(std_df)
    print(f"Successfully processed {len(df)} Gymshark products")
    
except Exception as e:
    print(f"Error processing Gymshark dataset: {e}")

# 4. Process Edikted dataset
try:
    print("Processing Edikted dataset...")
    df = pd.read_csv(dataset_dir / 'edikted_products.csv')
    df['brand'] = 'Edikted'
    df['id'] = 'ed_' + df.index.astype(str)
    
    # Check and create columns if they don't exist
    if 'color' not in df.columns:
        df['color'] = None
    if 'price' not in df.columns:
        df['price'] = None
    if 'product_url' not in df.columns:
        df['product_url'] = None
    if 'image_url' not in df.columns:
        df['image_url'] = None
    
    # Apply classification
    df[['category', 'subcategory', 'style', 'extracted_color', 'fit']] = df.apply(classify_item, axis=1)
    
    # Use extracted color if available
    df['color'] = df.apply(lambda x: x['extracted_color'] if pd.isna(x['color']) else x['color'], axis=1)
    
    # Format the data for our standard schema
    std_df = pd.DataFrame({
        'id': df['id'],
        'name': df['name'],
        'brand': df['brand'],
        'category': df['category'],
        'subcategory': df['subcategory'],
        'color': df['color'],
        'price': df['price'],
        'image_url': df['image_url'],
        'product_url': df['product_url'],
        'style': df['style'],
        'fit': df['fit']
    })
    
    all_data.append(std_df)
    print(f"Successfully processed {len(df)} Edikted products")
    
except Exception as e:
    print(f"Error processing Edikted dataset: {e}")

# 5. Process Nakd dataset
try:
    print("Processing Nakd dataset...")
    df = pd.read_csv(dataset_dir / 'nakd_products.csv')
    
    # Check column availability
    print(f"Nakd columns: {df.columns.tolist()}")
    
    df['brand'] = 'Nakd'
    df['id'] = 'nakd_' + df.index.astype(str)
    
    # Check and create columns if they don't exist
    if 'color' not in df.columns:
        df['color'] = None
    if 'product_url' not in df.columns:
        df['product_url'] = None
    
    # Apply classification
    df[['category', 'subcategory', 'style', 'extracted_color', 'fit']] = df.apply(classify_item, axis=1)
    
    # Use extracted color if available
    df['color'] = df.apply(lambda x: x['extracted_color'] if pd.isna(x['color']) else x['color'], axis=1)
    
    # Format the data for our standard schema
    std_df = pd.DataFrame({
        'id': df['id'],
        'name': df['name'] if 'name' in df.columns else df.index.astype(str),
        'brand': df['brand'],
        'category': df['category'],
        'subcategory': df['subcategory'],
        'color': df['color'],
        'price': df['price'] if 'price' in df.columns else None,
        'image_url': df['image_url'] if 'image_url' in df.columns else None,
        'product_url': df['product_url'],
        'style': df['style'],
        'fit': df['fit']
    })
    
    all_data.append(std_df)
    print(f"Successfully processed {len(df)} Nakd products")
    
except Exception as e:
    print(f"Error processing Nakd dataset: {e}")

# 6. Process Cupshe dataset
try:
    print("Processing Cupshe dataset...")
    df = pd.read_csv(dataset_dir / 'cupshe_products.csv')
    
    # Check column availability
    print(f"Cupshe columns: {df.columns.tolist()}")
    
    df['brand'] = 'Cupshe'
    df['id'] = 'cup_' + df.index.astype(str)
    
    # Check and create columns if they don't exist
    if 'color' not in df.columns:
        df['color'] = None
    if 'price' not in df.columns:
        df['price'] = None
    if 'product_url' not in df.columns:
        df['product_url'] = None
    
    # Apply classification
    df[['category', 'subcategory', 'style', 'extracted_color', 'fit']] = df.apply(classify_item, axis=1)
    
    # Use extracted color if available
    df['color'] = df.apply(lambda x: x['extracted_color'] if pd.isna(x['color']) else x['color'], axis=1)
    
    # Format the data for our standard schema
    std_df = pd.DataFrame({
        'id': df['id'],
        'name': df['name'] if 'name' in df.columns else df.index.astype(str),
        'brand': df['brand'],
        'category': df['category'],
        'subcategory': df['subcategory'],
        'color': df['color'],
        'price': df['price'],
        'image_url': df['image_url'] if 'image_url' in df.columns else None,
        'product_url': df['product_url'],
        'style': df['style'],
        'fit': df['fit']
    })
    
    all_data.append(std_df)
    print(f"Successfully processed {len(df)} Cupshe products")
    
except Exception as e:
    print(f"Error processing Cupshe dataset: {e}")

# 7. Process Altardstate dataset
try:
    print("Processing Altardstate dataset...")
    df = pd.read_csv(dataset_dir / 'altardstate_products.csv')
    
    # Check column availability
    print(f"Altardstate columns: {df.columns.tolist()}")
    
    df['brand'] = 'Altardstate'
    df['id'] = 'as_' + df.index.astype(str)
    
    # Check and create columns if they don't exist
    if 'color' not in df.columns:
        df['color'] = None
    if 'product_url' not in df.columns:
        df['product_url'] = None
    
    # Apply classification
    df[['category', 'subcategory', 'style', 'extracted_color', 'fit']] = df.apply(classify_item, axis=1)
    
    # Use extracted color if available
    df['color'] = df.apply(lambda x: x['extracted_color'] if pd.isna(x['color']) else x['color'], axis=1)
    
    # Format the data for our standard schema
    std_df = pd.DataFrame({
        'id': df['id'],
        'name': df['name'] if 'name' in df.columns else df.index.astype(str),
        'brand': df['brand'],
        'category': df['category'],
        'subcategory': df['subcategory'],
        'color': df['color'],
        'price': df['price'] if 'price' in df.columns else None,
        'image_url': df['image_url'] if 'image_url' in df.columns else None,
        'product_url': df['product_url'],
        'style': df['style'],
        'fit': df['fit']
    })
    
    all_data.append(std_df)
    print(f"Successfully processed {len(df)} Altardstate products")
    
except Exception as e:
    print(f"Error processing Altardstate dataset: {e}")

# 8. Process Vuori dataset
try:
    print("Processing Vuori dataset...")
    df = pd.read_csv(dataset_dir / 'vuori_products.csv')
    
    # Check column availability
    print(f"Vuori columns: {df.columns.tolist()}")
    
    df['brand'] = 'Vuori'
    df['id'] = 'vu_' + df.index.astype(str)
    
    # Check and create columns if they don't exist
    if 'product_url' not in df.columns:
        df['product_url'] = None
    
    # Apply classification
    df[['category', 'subcategory', 'style', 'extracted_color', 'fit']] = df.apply(classify_item, axis=1)
    
    # Format the data for our standard schema
    std_df = pd.DataFrame({
        'id': df['id'],
        'name': df['name'] if 'name' in df.columns else df.index.astype(str),
        'brand': df['brand'],
        'category': df['category'],
        'subcategory': df['subcategory'],
        'color': df['color'] if 'color' in df.columns else df['extracted_color'],
        'price': df['price'] if 'price' in df.columns else None,
        'image_url': df['image_url'] if 'image_url' in df.columns else None,
        'product_url': df['product_url'],
        'style': df['style'],
        'fit': df['fit']
    })
    
    all_data.append(std_df)
    print(f"Successfully processed {len(df)} Vuori products")
    
except Exception as e:
    print(f"Error processing Vuori dataset: {e}")

# Combine all datasets
try:
    combined_df = pd.concat(all_data, ignore_index=True)
    
    # Clean up price column
    combined_df['price'] = combined_df['price'].astype(str).str.replace('$', '').str.replace(',', '')
    combined_df['price'] = pd.to_numeric(combined_df['price'], errors='coerce')
    
    # Create price range column
    def price_range(price):
        if pd.isna(price) or price < 0:
            return 'unknown'
        elif price <= 30:
            return 'budget'
        elif price <= 75:
            return 'mid-range'
        elif price <= 150:
            return 'premium'
        else:
            return 'luxury'
            
    combined_df['price_range'] = combined_df['price'].apply(price_range)
    
    # Fill missing values
    combined_df = combined_df.fillna({
        'name': 'Unknown Product',
        'category': 'other',
        'subcategory': 'other',
        'color': 'unknown',
        'price': 0,
        'image_url': 'https://placehold.co/400x500/e0e0e0/black?text=No+Image',
        'product_url': '#',
        'style': 'casual',
        'fit': 'regular',
        'price_range': 'unknown'
    })
    
    # Save processed data
    combined_df.to_csv(output_dir / 'unified_clothing_data.csv', index=False)
    
    # Create a clean JSON file for the app
    json_data = combined_df.fillna('').to_dict(orient='records')
    import json
    with open(output_dir / 'clothing_data.json', 'w') as f:
        json.dump(json_data, f)
        
    print(f"\nProcessing complete! Found {len(combined_df)} items.")
    print(f"Category distribution:\n{combined_df['category'].value_counts()}")
    print(f"Brand distribution:\n{combined_df['brand'].value_counts()}")
    print(f"Style distribution:\n{combined_df['style'].value_counts()}")
    print(f"Price range distribution:\n{combined_df['price_range'].value_counts()}")
    print(f"\nFiles saved to {output_dir}")
    
except Exception as e:
    print(f"Error combining datasets: {e}")
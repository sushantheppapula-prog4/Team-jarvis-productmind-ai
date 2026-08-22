#!/bin/bash
find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/.next/*" -not -name "replace.sh" -exec bash -c '
  for file do
    if grep -iq "productmind" "$file" || grep -iq "product mind" "$file"; then
      echo "Processing $file"
      # Replace "ProductMind AI" with "Clyra"
      sed -i "s/ProductMind AI/Clyra/g" "$file"
      
      # Replace "Product Mind AI" with "Clyra"
      sed -i "s/Product Mind AI/Clyra/g" "$file"
      
      # Replace "ProductMind Agent" with "Clyra Agent"
      sed -i "s/ProductMind Agent/Clyra Agent/g" "$file"
      
      # Replace "ProductMind Dashboard" with "Clyra Dashboard"
      sed -i "s/ProductMind Dashboard/Clyra Dashboard/g" "$file"
      
      # Replace "ProductMind Insights" with "Clyra Insights"
      sed -i "s/ProductMind Insights/Clyra Insights/g" "$file"
      
      # Replace "ProductMind Reports" with "Clyra Reports"
      sed -i "s/ProductMind Reports/Clyra Reports/g" "$file"
      
      # General replacements
      sed -i "s/ProductMind/Clyra/g" "$file"
      sed -i "s/Product Mind/Clyra/g" "$file"
      sed -i "s/productmind/clyra/g" "$file"
      sed -i "s/PRODUCTMIND/CLYRA/g" "$file"
    fi
  done
' sh {} +

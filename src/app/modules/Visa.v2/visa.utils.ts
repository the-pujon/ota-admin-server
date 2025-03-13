
/**
 * Helper function to prepare document arrays
 * @param documents Array of document objects from the request
 * @param files Array of uploaded files
 * @param iconPrefix Prefix for the icon field names
 * @returns Formatted document array
 */
export function prepareDocuments(documents: any[], files: any[], iconPrefix: string) {
    if (!documents) return [];
    
    return documents.map((doc: any, index: number) => {
      // Find the icon file for this document
      const iconFile = files.find((file: any) => 
        file.fieldname === `${iconPrefix}[${index}]`
      );
      
      return {
        title: doc.title,
        details: doc.details || [],
        icon: iconFile?.path || '',
      };
    });
  }


  /**
 * Helper function to prepare document arrays
 * @param documents Array of document objects from the request
 * @param files Array of uploaded files
 * @param iconPrefix Prefix for the icon field names
 * @param existingIcons (Optional) Existing icons to retain if no new icon is uploaded
 * @returns Formatted document array
 */
export function prepareDocumentsForUpdate(documents: any[], files: any[], iconPrefix: string, existingIcons: any[] = []) {
  if (!documents) return [];
  
  return documents.map((doc: any, index: number) => {
    // Find the icon file for this document
    const iconFile = files.find((file: any) => 
      file.fieldname === `${iconPrefix}[${index}]`
    );

    // If no new icon is uploaded, keep the existing one
    const icon = iconFile?.path || existingIcons[index]?.icon || '';
    
    return {
      title: doc.title,
      details: doc.details || [],
      icon: icon,
    };
  });
}

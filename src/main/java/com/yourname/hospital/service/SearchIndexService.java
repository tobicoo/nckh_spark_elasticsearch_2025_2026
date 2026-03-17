package com.yourname.hospital.service;

import com.yourname.hospital.dto.SearchReindexResponse;
import com.yourname.hospital.entity.MetadataRecord;
import com.yourname.hospital.repository.MetadataRecordRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class SearchIndexService {

    private final ElasticsearchService elasticsearchService;
    private final MetadataRecordRepository metadataRepository;
    private final SparkJobService sparkJobService;

    public SearchIndexService(
            ElasticsearchService elasticsearchService,
            MetadataRecordRepository metadataRepository,
            SparkJobService sparkJobService) {
        this.elasticsearchService = elasticsearchService;
        this.metadataRepository = metadataRepository;
        this.sparkJobService = sparkJobService;
    }

    public void indexMetadata(MetadataRecord metadata) {
        if (!elasticsearchService.isEnabled() || metadata == null) {
            return;
        }
        try {
            elasticsearchService.indexMetadata(metadata);
        } catch (Exception ignored) {
            // Avoid failing the main transaction on search indexing errors.
        }
    }

    public void deleteMetadata(Long recordId) {
        if (!elasticsearchService.isEnabled() || recordId == null) {
            return;
        }
        try {
            elasticsearchService.deleteMetadata(recordId);
        } catch (Exception ignored) {
            // Ignore delete failures to keep core flows stable.
        }
    }

    public SearchReindexResponse reindexAll() {
        if (sparkJobService.isEnabled()) {
            SparkJobService.SparkJobResult result = sparkJobService.runReindexJob();
            return new SearchReindexResponse(0, result.getStatus(), result.getOutput());
        }
        if (!elasticsearchService.isEnabled()) {
            return new SearchReindexResponse(0, "SKIPPED", "Elasticsearch is disabled.");
        }
        List<MetadataRecord> all = metadataRepository.findAll();
        int count = 0;
        for (MetadataRecord record : all) {
            indexMetadata(record);
            count += 1;
        }
        return new SearchReindexResponse(count, "OK", null);
    }
}
